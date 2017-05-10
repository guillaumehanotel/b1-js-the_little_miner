
    /**
     * ENUMERATION TYPEBLOCK
     * défini les types de blocs disponibles avec leurs noms et leurs résistances
     */
    var TYPEBLOCK = {

        DIRT: { name: "Dirt", resistance: RESISTANCE_DIRT },
        STONE: { name: "Stone" , resistance: RESISTANCE_STONE },
        BEDROCK: { name: "Bedrock" , resistance: RESISTANCE_BEDROCK },
        TNT: { name: "Tnt" , resistance: RESISTANCE_TNT },
        DYNAMITE: { name: "Dynamite" , resistance: RESISTANCE_DYNAMITE },
        BONUS: { name: "Bonus" , resistance: RESISTANCE_BONUS },
        COAL: { name: "Coal" , resistance: RESISTANCE_COAL },
        IRON: { name: "Iron" , resistance: RESISTANCE_IRON },
        GOLD: { name: "Gold" , resistance: RESISTANCE_GOLD },
        DIAMOND: { name: "Diamond" , resistance: RESISTANCE_DIAMOND }

    };
    /* impossibilité de changer les énumérations */
    Object.freeze(TYPEBLOCK);
