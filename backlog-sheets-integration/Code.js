function doPost(e) {
  try {
    // BacklogのGit Webhookデータを解析
    if (!e.parameter.payload) {
      throw new Error("No payload found");
    }

    const webhookData = JSON.parse(e.parameter.payload);
    const sheet = SpreadsheetApp.getActiveSheet();
    const timestamp = new Date();
    const nullHash = "0000000000000000000000000000000000000000";

    // タグの新規作成
    if (webhookData.ref && webhookData.ref.startsWith("refs/tags/")) {
      const tagName = webhookData.ref.replace("refs/tags/", "");

      // タグ作成のみ記録（削除は無視）
      if (webhookData.before === nullHash) {
        sheet.appendRow([
          timestamp,
          "TAG_CREATE",
          tagName,
          webhookData.after,
          "",
          "タグが作成されました",
        ]);
      }
    }
    // ブランチの新規作成のみ
    else if (webhookData.ref && webhookData.ref.startsWith("refs/heads/")) {
      const branchName = webhookData.ref.replace("refs/heads/", "");

      // 新規ブランチ作成のみ記録
      if (webhookData.before === nullHash) {
        const author =
          webhookData.revisions && webhookData.revisions[0]
            ? webhookData.revisions[0].author.name
            : "";
        const message =
          webhookData.revisions && webhookData.revisions[0]
            ? webhookData.revisions[0].message
            : "";

        sheet.appendRow([
          timestamp,
          "BRANCH_CREATE",
          branchName,
          webhookData.after,
          author,
          message || "ブランチが作成されました",
        ]);
      }
    }

    return ContentService.createTextOutput("OK");
  } catch (error) {
    Logger.log("Error: " + error.toString());
    Logger.log("Request data: " + JSON.stringify(e));
    return ContentService.createTextOutput("Error: " + error.toString());
  }
}

// テスト用関数 - 手動実行でスプレッドシートに書き込みテスト
function testWrite() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const timestamp = new Date();
  sheet.appendRow([
    timestamp,
    "TEST",
    "test-branch",
    "abc123",
    "test-user",
    "テスト書き込み - GAS正常動作中"
  ]);
  Logger.log("Test write completed");
}
