using System.Collections.Generic;
using UnityEngine;

namespace CartoonsTCG.Core
{
    /// <summary>
    /// Definition of a sellable booster pack and the logic that "unboxes" it.
    ///
    /// Pack composition (for the default 5 cards): 3 Commons (60%), 1 Uncommon (25%) and
    /// 1 "Rare or higher" slot (15%). The slot layout is guaranteed; the randomness is in
    /// which card fills each slot and, for the last slot, which rarity tier it lands in.
    /// For other pack sizes, extra cards are Commons.
    /// </summary>
    [CreateAssetMenu(fileName = "NewBoosterPack", menuName = "CartoonsTCG/Booster Pack Data", order = 1)]
    public class BoosterPackData : ScriptableObject
    {
        /// <summary>Slots in a pack that are not Commons: 1 Uncommon + 1 Rare-or-higher.</summary>
        private const int NonCommonSlots = 2;

        [Header("Identity")]
        [SerializeField] private string packID;
        [SerializeField] private string packName;
        [Min(0f)]
        [SerializeField] private float packPrice = 3f;

        [Header("Contents")]
        [SerializeField] private List<CardData> possibleCards = new List<CardData>();
        [Min(NonCommonSlots)]
        [SerializeField] private int cardsPerPack = 5;

        [Header("Rare Slot Weights (relative, need not sum to 100)")]
        [Min(0f)] [SerializeField] private float rareWeight = 80f;
        [Min(0f)] [SerializeField] private float holoRareWeight = 17f;
        [Min(0f)] [SerializeField] private float secretFullArtWeight = 3f;

        public string PackID => packID;
        public string PackName => packName;
        public float PackPrice => packPrice;
        public IReadOnlyList<CardData> PossibleCards => possibleCards;
        public int CardsPerPack => cardsPerPack;

        /// <summary>
        /// Simulates opening the pack and returns the pulled cards (commons first, the
        /// rare-or-higher card last, so UIs can reveal the best card at the end).
        /// Returns an empty list if the pack has no cards configured.
        /// </summary>
        public List<CardData> OpenPack()
        {
            var result = new List<CardData>(Mathf.Max(cardsPerPack, NonCommonSlots));

            if (possibleCards == null || possibleCards.Count == 0)
            {
                Debug.LogWarning($"[BoosterPackData] Pack '{packName}' has no possible cards.", this);
                return result;
            }

            // Bucket the pool by rarity once per opening.
            var byRarity = new Dictionary<Rarity, List<CardData>>();
            foreach (var card in possibleCards)
            {
                if (card == null) continue;
                if (!byRarity.TryGetValue(card.Rarity, out var list))
                    byRarity[card.Rarity] = list = new List<CardData>();
                list.Add(card);
            }

            int commonCount = Mathf.Max(0, cardsPerPack - NonCommonSlots);
            for (int i = 0; i < commonCount; i++)
                AddRandom(result, byRarity, Rarity.Common);

            AddRandom(result, byRarity, Rarity.Uncommon);
            AddRandom(result, byRarity, RollRareSlotRarity(byRarity));

            return result;
        }

        /// <summary>
        /// Picks the tier for the rare slot using the weights, considering only tiers that
        /// actually have cards in the pool. Falls back to Rare if nothing is available
        /// (AddRandom then handles the missing tier).
        /// </summary>
        private Rarity RollRareSlotRarity(Dictionary<Rarity, List<CardData>> byRarity)
        {
            float rare = Available(byRarity, Rarity.Rare) ? rareWeight : 0f;
            float holo = Available(byRarity, Rarity.HoloRare) ? holoRareWeight : 0f;
            float secret = Available(byRarity, Rarity.SecretFullArt) ? secretFullArtWeight : 0f;

            float total = rare + holo + secret;
            if (total <= 0f) return Rarity.Rare;

            float roll = Random.value * total;
            if (roll < rare) return Rarity.Rare;
            if (roll < rare + holo) return Rarity.HoloRare;
            return Rarity.SecretFullArt;
        }

        private static bool Available(Dictionary<Rarity, List<CardData>> byRarity, Rarity rarity) =>
            byRarity.TryGetValue(rarity, out var list) && list.Count > 0;

        /// <summary>
        /// Adds a random card of the wanted rarity. If that tier is empty, falls back to the
        /// nearest lower tier, then to any card, so a sparse pool never yields a short pack.
        /// </summary>
        private void AddRandom(List<CardData> result, Dictionary<Rarity, List<CardData>> byRarity, Rarity wanted)
        {
            for (int r = (int)wanted; r >= (int)Rarity.Common; r--)
            {
                if (byRarity.TryGetValue((Rarity)r, out var list) && list.Count > 0)
                {
                    result.Add(list[Random.Range(0, list.Count)]);
                    return;
                }
            }

            // Nothing at or below the wanted tier: take anything from the pool.
            foreach (var list in byRarity.Values)
            {
                if (list.Count > 0)
                {
                    Debug.LogWarning($"[BoosterPackData] Pack '{packName}' has no {wanted} or lower cards; using a higher tier.", this);
                    result.Add(list[Random.Range(0, list.Count)]);
                    return;
                }
            }
        }

        /// <summary>Editor/test helper to configure a pack from code.</summary>
        public void Initialize(string id, string name, float price, List<CardData> cards, int perPack = 5)
        {
            packID = id;
            packName = name;
            packPrice = Mathf.Max(0f, price);
            possibleCards = cards ?? new List<CardData>();
            cardsPerPack = Mathf.Max(NonCommonSlots, perPack);
        }
    }
}
