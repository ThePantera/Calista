using UnityEngine;

namespace CartoonsTCG.Core
{
    /// <summary>
    /// Card rarity tiers, ordered from least to most rare.
    /// The integer values are used for ordering, so do not reorder existing entries
    /// (it would also break serialized assets).
    /// </summary>
    public enum Rarity
    {
        Common = 0,
        Uncommon = 1,
        Rare = 2,
        HoloRare = 3,
        SecretFullArt = 4
    }

    /// <summary>Helpers for <see cref="Rarity"/>.</summary>
    public static class RarityExtensions
    {
        /// <summary>True for Rare and every tier above it.</summary>
        public static bool IsRareOrHigher(this Rarity rarity) => rarity >= Rarity.Rare;

        /// <summary>Default glow colour used when card data does not specify one.</summary>
        public static Color GetDefaultGlowColor(this Rarity rarity)
        {
            switch (rarity)
            {
                case Rarity.Common:        return new Color(0.75f, 0.75f, 0.75f, 1f); // silver
                case Rarity.Uncommon:      return new Color(0.30f, 0.85f, 0.40f, 1f); // green
                case Rarity.Rare:          return new Color(0.25f, 0.55f, 1.00f, 1f); // blue
                case Rarity.HoloRare:      return new Color(0.75f, 0.35f, 1.00f, 1f); // purple
                case Rarity.SecretFullArt: return new Color(1.00f, 0.80f, 0.15f, 1f); // gold
                default:                   return Color.white;
            }
        }
    }
}
