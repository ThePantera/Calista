using UnityEngine;

namespace CartoonsTCG.Core
{
    /// <summary>
    /// Immutable (at runtime) definition of a single collectible card.
    /// Assets live in Assets/Resources/Cards/ so they can be loaded with Resources.LoadAll.
    /// </summary>
    [CreateAssetMenu(fileName = "NewCard", menuName = "CartoonsTCG/Card Data", order = 0)]
    public class CardData : ScriptableObject
    {
        [Header("Identity")]
        [SerializeField] private string cardID;
        [SerializeField] private string cardName;
        [SerializeField] private string setID;

        [Header("Stats")]
        [SerializeField] private Rarity rarity = Rarity.Common;
        [Min(0f)]
        [SerializeField] private float baseMarketValue = 0.1f;

        [Header("Presentation")]
        [SerializeField] private Sprite cardIllustration;
        [SerializeField] private Color rarityGlowColor = Color.white;

        public string CardID => cardID;
        public string CardName => cardName;
        public string SetID => setID;
        public Rarity Rarity => rarity;
        public float BaseMarketValue => baseMarketValue;
        public Sprite CardIllustration => cardIllustration;
        public Color RarityGlowColor => rarityGlowColor;

        /// <summary>
        /// Populates every field. Used by the editor importer (and tests); gameplay code
        /// should treat card data as read-only.
        /// </summary>
        public void Initialize(string id, string name, string set, Rarity cardRarity,
                               float marketValue, Sprite illustration, Color glowColor)
        {
            cardID = id;
            cardName = name;
            setID = set;
            rarity = cardRarity;
            baseMarketValue = Mathf.Max(0f, marketValue);
            cardIllustration = illustration;
            rarityGlowColor = glowColor;
        }
    }
}
