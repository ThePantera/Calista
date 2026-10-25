using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using UnityEditor;
using UnityEngine;

namespace CartoonsTCG.Core.Editor
{
    /// <summary>
    /// Editor utility that turns a JSON card list into <see cref="CardData"/> assets under
    /// Assets/Resources/Cards/. Re-importing updates existing assets in place (matched by
    /// cardID file name) so references from packs and scenes are preserved.
    ///
    /// Expected JSON (see Assets/Editor/SampleData/SampleCards.json):
    /// { "cards": [ { "cardID", "cardName", "setID", "rarity", "baseMarketValue",
    ///                "glowColor" (#RRGGBB[AA], optional), "illustrationPath" (optional) } ] }
    /// </summary>
    public static class CardDatabaseImporter
    {
        private const string OutputFolder = "Assets/Resources/Cards";
        private const string SampleJsonPath = "Assets/Editor/SampleData/SampleCards.json";

        // ---- JSON DTOs (JsonUtility needs public serializable fields) ----------------------

        [Serializable]
        private class CardDatabaseJson
        {
            public List<CardJson> cards = new List<CardJson>();
        }

        [Serializable]
        private class CardJson
        {
            public string cardID;
            public string cardName;
            public string setID;
            public string rarity;           // enum name, case-insensitive
            public float baseMarketValue;
            public string glowColor;        // optional "#RRGGBB" / "#RRGGBBAA"
            public string illustrationPath; // optional AssetDatabase path to a Sprite
        }

        /// <summary>Counts returned by an import run.</summary>
        public readonly struct ImportResult
        {
            public readonly int Created;
            public readonly int Updated;
            public readonly int Skipped;

            public ImportResult(int created, int updated, int skipped)
            {
                Created = created;
                Updated = updated;
                Skipped = skipped;
            }
        }

        // ---- Menu entries -------------------------------------------------------------------

        [MenuItem("Tools/CartoonsTCG/Import Sample Cards")]
        public static void ImportSampleCards()
        {
            var textAsset = AssetDatabase.LoadAssetAtPath<TextAsset>(SampleJsonPath);
            if (textAsset == null)
            {
                Debug.LogError($"[CardDatabaseImporter] Sample JSON not found at {SampleJsonPath}.");
                return;
            }
            ReportResult(ImportFromJson(textAsset.text), SampleJsonPath);
        }

        [MenuItem("Tools/CartoonsTCG/Import Cards From JSON File...")]
        public static void ImportFromFileDialog()
        {
            string path = EditorUtility.OpenFilePanel("Select card JSON", Application.dataPath, "json,txt");
            if (string.IsNullOrEmpty(path)) return;
            ReportResult(ImportFromFile(path), path);
        }

        // ---- Public API ---------------------------------------------------------------------

        /// <summary>Imports cards from a JSON file on disk.</summary>
        public static ImportResult ImportFromFile(string filePath)
        {
            if (!File.Exists(filePath))
            {
                Debug.LogError($"[CardDatabaseImporter] File not found: {filePath}");
                return new ImportResult(0, 0, 0);
            }
            return ImportFromJson(File.ReadAllText(filePath, Encoding.UTF8));
        }

        /// <summary>Imports cards from a JSON string, creating or updating one asset per card.</summary>
        public static ImportResult ImportFromJson(string json)
        {
            if (string.IsNullOrWhiteSpace(json))
            {
                Debug.LogError("[CardDatabaseImporter] JSON is empty.");
                return new ImportResult(0, 0, 0);
            }

            CardDatabaseJson db;
            try
            {
                db = JsonUtility.FromJson<CardDatabaseJson>(json);
            }
            catch (Exception e)
            {
                Debug.LogError($"[CardDatabaseImporter] Invalid JSON: {e.Message}");
                return new ImportResult(0, 0, 0);
            }

            if (db == null || db.cards == null || db.cards.Count == 0)
            {
                Debug.LogError("[CardDatabaseImporter] JSON contains no cards (expected a top-level \"cards\" array).");
                return new ImportResult(0, 0, 0);
            }

            EnsureFolder(OutputFolder);

            int created = 0, updated = 0, skipped = 0;
            var seenIds = new HashSet<string>();

            // Batch asset writes so Unity refreshes only once.
            AssetDatabase.StartAssetEditing();
            try
            {
                foreach (var entry in db.cards)
                {
                    if (!Validate(entry, seenIds, out Rarity rarity))
                    {
                        skipped++;
                        continue;
                    }

                    string assetPath = $"{OutputFolder}/{SanitizeFileName(entry.cardID)}.asset";
                    var card = AssetDatabase.LoadAssetAtPath<CardData>(assetPath);
                    bool isNew = card == null;
                    if (isNew) card = ScriptableObject.CreateInstance<CardData>();

                    card.Initialize(
                        entry.cardID.Trim(),
                        entry.cardName.Trim(),
                        (entry.setID ?? string.Empty).Trim(),
                        rarity,
                        entry.baseMarketValue,
                        LoadSprite(entry),
                        ResolveGlowColor(entry, rarity));

                    if (isNew)
                    {
                        AssetDatabase.CreateAsset(card, assetPath);
                        created++;
                    }
                    else
                    {
                        EditorUtility.SetDirty(card);
                        updated++;
                    }
                }
            }
            finally
            {
                AssetDatabase.StopAssetEditing();
            }

            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            return new ImportResult(created, updated, skipped);
        }

        // ---- Helpers ------------------------------------------------------------------------

        private static bool Validate(CardJson entry, HashSet<string> seenIds, out Rarity rarity)
        {
            rarity = Rarity.Common;

            if (entry == null || string.IsNullOrWhiteSpace(entry.cardID))
            {
                Debug.LogWarning("[CardDatabaseImporter] Skipping entry with missing cardID.");
                return false;
            }
            if (string.IsNullOrWhiteSpace(entry.cardName))
            {
                Debug.LogWarning($"[CardDatabaseImporter] Skipping '{entry.cardID}': missing cardName.");
                return false;
            }
            if (!seenIds.Add(entry.cardID.Trim()))
            {
                Debug.LogWarning($"[CardDatabaseImporter] Skipping duplicate cardID '{entry.cardID}'.");
                return false;
            }
            if (!Enum.TryParse(entry.rarity, true, out rarity) || !Enum.IsDefined(typeof(Rarity), rarity))
            {
                Debug.LogWarning($"[CardDatabaseImporter] Skipping '{entry.cardID}': unknown rarity '{entry.rarity}'.");
                return false;
            }
            if (entry.baseMarketValue < 0f)
            {
                Debug.LogWarning($"[CardDatabaseImporter] '{entry.cardID}' has a negative baseMarketValue; clamping to 0.");
                entry.baseMarketValue = 0f;
            }
            return true;
        }

        private static Color ResolveGlowColor(CardJson entry, Rarity rarity)
        {
            if (!string.IsNullOrWhiteSpace(entry.glowColor))
            {
                string hex = entry.glowColor.Trim();
                if (!hex.StartsWith("#")) hex = "#" + hex;
                if (ColorUtility.TryParseHtmlString(hex, out Color parsed)) return parsed;
                Debug.LogWarning($"[CardDatabaseImporter] '{entry.cardID}': invalid glowColor '{entry.glowColor}'; using rarity default.");
            }
            return rarity.GetDefaultGlowColor();
        }

        private static Sprite LoadSprite(CardJson entry)
        {
            if (string.IsNullOrWhiteSpace(entry.illustrationPath)) return null;

            var sprite = AssetDatabase.LoadAssetAtPath<Sprite>(entry.illustrationPath);
            if (sprite == null)
                Debug.LogWarning($"[CardDatabaseImporter] '{entry.cardID}': no Sprite at '{entry.illustrationPath}'.");
            return sprite;
        }

        /// <summary>Replaces characters that are invalid in file names.</summary>
        private static string SanitizeFileName(string name)
        {
            var sb = new StringBuilder(name.Trim());
            foreach (char c in Path.GetInvalidFileNameChars())
                sb.Replace(c, '_');
            return sb.ToString();
        }

        /// <summary>Creates every missing folder along an "Assets/..." path.</summary>
        private static void EnsureFolder(string folderPath)
        {
            if (AssetDatabase.IsValidFolder(folderPath)) return;

            string parent = Path.GetDirectoryName(folderPath).Replace('\\', '/');
            EnsureFolder(parent);
            AssetDatabase.CreateFolder(parent, Path.GetFileName(folderPath));
        }

        private static void ReportResult(ImportResult r, string source)
        {
            Debug.Log($"[CardDatabaseImporter] Imported '{source}': {r.Created} created, {r.Updated} updated, {r.Skipped} skipped.");
        }
    }
}
