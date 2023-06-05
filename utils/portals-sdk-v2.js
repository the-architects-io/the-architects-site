// sdk/wrapper for portals related functionality

const PortalsSdk = {
  Origin: {
    Localhost: "http://localhost:3000",
    Dev: "https://dev.theportal.to",
    Prev: "https://preview.theportal.to",
    Prod: "https://theportal.to",
    Staging: "https://deploy-preview-114--portal-backend.netlify.app",
    Staging2: "https://deploy-preview-117--portal-backend.netlify.app",
  },

  Callbacks: {
    publicKey: null,
    publicId: null,
    requestItem: null,
    getItemData: null,
    sellItem: null,
    getInventoryData: null,
    getQuestState: null,
    startQuest: null,
    getRoomId: null,
    claimZone: null,
  },

  OnMessage: (e) => {
    if (
      typeof e.data === "string" &&
      e.data.startsWith("requestedPublicKey:")
    ) {
      let publicKey = e.data.split(":")[1];
      PortalsSdk.Callbacks.publicKey(publicKey);
    }
    if (typeof e.data === "string" && e.data.startsWith("requestedPublicId:")) {
      let publicId = e.data.split(":")[1];
      PortalsSdk.Callbacks.publicId(publicId);
    }
    if (
      e.data.groupedItems &&
      e.data.type == "buy" &&
      (e.data.success != null || e.data.error != null)
    ) {
      PortalsSdk.Callbacks.requestItem(e.data);
    }
    if (e.data.itemData && e.data.itemData.length > 0) {
      PortalsSdk.Callbacks.getItemData(e.data);
    }
    if (
      e.data.groupedItems &&
      e.data.type == "sell" &&
      (e.data.success != null || e.data.error != null)
    ) {
      PortalsSdk.Callbacks.sellItem(e.data);
    }
    if (
      PortalsSdk.Callbacks.getInventoryData != null &&
      e.data.groupedItems &&
      !e.data.type
    ) {
      PortalsSdk.Callbacks.getInventoryData(e.data);
    }
    if (e.data.state) {
      PortalsSdk.Callbacks.getQuestState(e.data);
    }
    if (e.data.createdQuest) {
      PortalsSdk.Callbacks.startQuest(e.data);
    }
    if (e.data.roomId) {
      PortalsSdk.Callbacks.getRoomId(e.data);
    }
    if (e.data.claimedZone) {
      PortalsSdk.Callbacks.claimZone(e.data);
    }
  },
  // originUrl: url of the portals (examples: https://dev.theportal.to, https://theportal.to)
  requestPublicKey(originUrl, callback) {
    PortalsSdk.Callbacks.publicKey = callback;
    window.onmessage = PortalsSdk.OnMessage;

    parent.postMessage("publicKeyRequest", originUrl);

    console.log("public key requested");
  },

  requestPublicId(originUrl, callback) {
    PortalsSdk.Callbacks.publicId = callback;
    window.onmessage = PortalsSdk.OnMessage;

    parent.postMessage("publicIdRequest", originUrl);

    console.log("public id requested");
  },

  requestItem(
    originUrl,
    generatorId,
    wallet,
    publicId,
    count,
    notiMsg,
    notiSound,
    callback
  ) {
    PortalsSdk.Callbacks.requestItem = callback;
    window.onmessage = PortalsSdk.OnMessage;
    let n = count || 1;

    parent.postMessage(
      {
        generatorId: generatorId,
        userId: wallet,
        publicId: publicId,
        count: n,
        notiMsg: notiMsg,
        notiSound: notiSound,
      },
      originUrl
    );

    console.log("item to user inventory requested");
  },

  getItemData(originUrl, keys, publicId, callback) {
    PortalsSdk.Callbacks.getItemData = callback;
    window.onmessage = PortalsSdk.OnMessage;

    parent.postMessage(
      {
        keys,
        type: "itemData",
        publicId: publicId,
      },
      originUrl
    );

    console.log("item data requested");
  },

  sellItem(originUrl, id, itemGeneratorId, wallet, publicId, amount, callback) {
    PortalsSdk.Callbacks.sellItem = callback;
    window.onmessage = PortalsSdk.OnMessage;

    parent.postMessage(
      {
        type: "sell",
        itemId: id,
        userId: wallet,
        publicId: publicId,
        itemGeneratorId: itemGeneratorId,
        amount,
      },
      originUrl
    );

    console.log("item sell requested");
  },

  getInventoryData(originUrl, itemGeneratorKeys, itemGeneratorIds, callback) {
    PortalsSdk.Callbacks.getInventoryData = callback;
    window.onmessage = PortalsSdk.OnMessage;

    parent.postMessage(
      {
        type: "inventory",
        itemGeneratorKeys: itemGeneratorKeys,
        itemGeneratorIds: itemGeneratorIds,
      },
      originUrl
    );

    console.log("inventory requested");
  },

  getQuestState(originUrl, name, publicId, callback) {
    PortalsSdk.Callbacks.getQuestState = callback;
    window.onmessage = PortalsSdk.OnMessage;

    parent.postMessage(
      {
        questName: name,
        publicId: publicId,
      },
      originUrl
    );

    console.log("get quest state requested");
  },

  startQuest(originUrl, questId, publicId, notiMsg, notiSound, callback) {
    PortalsSdk.Callbacks.startQuest = callback;
    window.onmessage = PortalsSdk.OnMessage;

    parent.postMessage(
      {
        questId: questId,
        publicId: publicId,
        notiMsg: notiMsg,
        notiSound: notiSound,
      },
      originUrl
    );

    console.log("start quest requested");
  },

  getRoomId(callback) {
    PortalsSdk.Callbacks.getRoomId = callback;
    window.onmessage = PortalsSdk.OnMessage;

    parent.postMessage(
      {
        type: "getRoomId",
      },
      "*"
    );

    console.log("room id requested");
  },

  claimZone(zoneId, publicId, callback) {
    PortalsSdk.Callbacks.claimZone = callback;
    window.onmessage = PortalsSdk.OnMessage;

    parent.postMessage(
      {
        zoneId: zoneId,
        publicId: publicId,
      },
      "*"
    );

    console.log("claim plot requested");
  },
};

export default PortalsSdk;
