export const generateFakeMetadatas = (amountToGenerate = 20) => {
  function generateRandomElement(array: any) {
    return array[Math.floor(Math.random() * array.length)];
  }

  function generateFakeNft(nftNumber: number) {
    const backgrounds = ["stone tiles", "metal", "wood", "brick", "abstract"];
    const rocks = ["diamond", "ruby", "emerald", "sapphire", "crystal"];
    const labels = [
      "pet rock",
      "pet stone",
      "pet pebble",
      "pet boulder",
      "pet gem",
    ];
    const details = [
      "sparkly",
      "shiny",
      "smooth",
      "rough",
      "glittery",
      "dull",
      "polished",
      "matte",
      "glossy",
      "iridescent",
    ];

    return {
      name: `NFT #${nftNumber}`,
      symbol: "Add symbol",
      description: "Add description",
      seller_fee_basis_points: 1000,
      image: `${nftNumber}.png`,
      external_url: "https://the-architects.io/",
      edition: nftNumber,
      collection: {
        name: "Pet Rocks",
        family: "Pet Rock Universe",
      },
      attributes: [
        {
          trait_type: "backgrounds",
          value: generateRandomElement(backgrounds),
        },
        { trait_type: "rocks", value: generateRandomElement(rocks) },
        { trait_type: "labels", value: generateRandomElement(labels) },
        { trait_type: "details", value: generateRandomElement(details) },
      ],
      properties: {
        files: [
          {
            uri: `${nftNumber}.png`,
            type: "image/png",
          },
        ],
        category: "image",
        creators: [
          {
            address: "4ionNE2Tc7nB8w6CVLQx2FioNTjbaa5JxYJ7nbDkwxdt",
            share: 100,
          },
        ],
      },
    };
  }

  const nftArray = [];
  for (let i = 0; i < amountToGenerate; i++) {
    nftArray.push(generateFakeNft(i));
  }

  return JSON.parse(JSON.stringify(nftArray, null, 2));
};
