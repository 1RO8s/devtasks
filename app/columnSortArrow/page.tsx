"use client";

import React, { useState, useEffect } from "react";

// カラムグループの定義（labelとnameの2カラムで1グループ）
type ColumnGroup = {
  id: string;
  label: string; // 表示名（例: "年齢"）
  name: string; // 内部名（例: "age"）
  key: string; // データ取得用のキー
};

// カラム順序の型
type ColumnOrder = {
  id: string;
  order: number;
};

// サンプルデータ
type SampleData = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  age: number;
};

const initialColumnGroups: ColumnGroup[] = [
  { id: "name", label: "名前", name: "name", key: "name" },
  { id: "email", label: "メール", name: "email", key: "email" },
  { id: "age", label: "年齢", name: "age", key: "age" },
  { id: "role", label: "役割", name: "role", key: "role" },
  { id: "status", label: "ステータス", name: "status", key: "status" },
  { id: "createdAt", label: "作成日", name: "createdAt", key: "createdAt" },
];

const sampleData: SampleData[] = [
  {
    id: 1,
    name: "山田太郎",
    email: "yamada@example.com",
    age: 28,
    role: "開発者",
    status: "アクティブ",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "佐藤花子",
    email: "sato@example.com",
    age: 32,
    role: "デザイナー",
    status: "アクティブ",
    createdAt: "2024-01-20",
  },
  {
    id: 3,
    name: "鈴木一郎",
    email: "suzuki@example.com",
    age: 45,
    role: "マネージャー",
    status: "非アクティブ",
    createdAt: "2024-02-01",
  },
  {
    id: 4,
    name: "田中次郎",
    email: "tanaka@example.com",
    age: 25,
    role: "開発者",
    status: "アクティブ",
    createdAt: "2024-02-10",
  },
];

// DB送信のモック関数
async function saveColumnOrder(order: ColumnOrder[]): Promise<void> {
  // モック: 実際のAPI呼び出しをシミュレート
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // ランダムに成功/失敗をシミュレート（デモ用）
      const shouldFail = Math.random() < 0.1; // 10%の確率で失敗
      
      if (shouldFail) {
        reject(new Error("保存に失敗しました。もう一度お試しください。"));
      } else {
        console.log("保存するorder:", order);
        resolve();
      }
    }, 1000); // 1秒の遅延をシミュレート
  });
}

// カラムグループヘッダーコンポーネント（矢印ボタン付き）
function ColumnGroupHeader({
  group,
  index,
  totalGroups,
  onMoveLeft,
  onMoveRight,
}: {
  group: ColumnGroup;
  index: number;
  totalGroups: number;
  onMoveLeft: () => void;
  onMoveRight: () => void;
}) {
  const canMoveLeft = index > 0;
  const canMoveRight = index < totalGroups - 1;

  return (
    <>
      {/* Labelカラム（表示名） */}
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-r border-gray-200 relative">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onMoveLeft}
            disabled={!canMoveLeft}
            className={`p-1 rounded transition-colors ${
              canMoveLeft
                ? "text-gray-600 hover:bg-gray-200 hover:text-gray-900 cursor-pointer"
                : "text-gray-300 cursor-not-allowed"
            }`}
            title="左に移動"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <span className="flex-1 text-center">{group.label}</span>
          <button
            onClick={onMoveRight}
            disabled={!canMoveRight}
            className={`p-1 rounded transition-colors ${
              canMoveRight
                ? "text-gray-600 hover:bg-gray-200 hover:text-gray-900 cursor-pointer"
                : "text-gray-300 cursor-not-allowed"
            }`}
            title="右に移動"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </th>
      {/* Nameカラム（内部名） */}
      <th className="px-4 py-2 text-left text-xs font-normal text-gray-400 bg-gray-50 border-b border-gray-200">
        {group.name}
      </th>
    </>
  );
}

export default function ColumnSortArrowPage() {
  const [columnGroups, setColumnGroups] = useState<ColumnGroup[]>(initialColumnGroups);
  const [order, setOrder] = useState<ColumnOrder[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // カラムグループの順序からorderを生成
  useEffect(() => {
    const newOrder: ColumnOrder[] = columnGroups.map((group, index) => ({
      id: group.id,
      order: index + 1,
    }));
    setOrder(newOrder);
  }, [columnGroups]);

  // 並び替えが完了したら自動的に保存状態をリセット
  useEffect(() => {
    if (saveStatus === "success" || saveStatus === "error") {
      const timer = setTimeout(() => {
        setSaveStatus("idle");
        setErrorMessage("");
      }, 3000); // 3秒後に自動的にリセット

      return () => clearTimeout(timer);
    }
  }, [columnGroups, saveStatus]);

  // 左に移動
  const handleMoveLeft = (index: number) => {
    if (index === 0) return;

    setColumnGroups((groups) => {
      const newGroups = [...groups];
      [newGroups[index - 1], newGroups[index]] = [
        newGroups[index],
        newGroups[index - 1],
      ];
      return newGroups;
    });
  };

  // 右に移動
  const handleMoveRight = (index: number) => {
    if (index === columnGroups.length - 1) return;

    setColumnGroups((groups) => {
      const newGroups = [...groups];
      [newGroups[index], newGroups[index + 1]] = [
        newGroups[index + 1],
        newGroups[index],
      ];
      return newGroups;
    });
  };

  const handleSaveOrder = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    setErrorMessage("");

    try {
      await saveColumnOrder(order);
      setSaveStatus("success");
    } catch (error) {
      setSaveStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">カラム並び替えサンプル（矢印ボタン）</h1>
      <p className="text-gray-600 mb-6">
        カラムヘッダーの左右にある矢印ボタン（&lt; &gt;）をクリックしてカラムグループ（label + name）の順序を変更できます。
        各グループは表示名（label）と内部名（name）の2カラムで構成されています。
      </p>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              {/* 
                【重要】ヘッダー行の表示
                columnGroups配列の順序に従ってヘッダーを表示します。
                columnGroupsの順序を変更すると、ここに表示されるヘッダーの順序も自動的に変わります。
              */}
              {columnGroups.map((group, index) => (
                <ColumnGroupHeader
                  key={group.id}
                  group={group}
                  index={index}
                  totalGroups={columnGroups.length}
                  onMoveLeft={() => handleMoveLeft(index)}
                  onMoveRight={() => handleMoveRight(index)}
                />
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* 
              【重要】データ行の表示
              sampleDataの各行に対して、columnGroupsの順序に従ってデータを表示します。
              
              仕組み：
              1. sampleData.map() で各行（row）をループ
              2. 各行の中で columnGroups.map() で各グループをループ
              3. 各グループの key（例: "name", "email"）を使って row[key] でデータを取得
              
              つまり、ヘッダーもデータ行も同じ columnGroups 配列を参照しているため、
              columnGroups の順序を変更すると、ヘッダーとデータ行の両方が同じ順序で表示されます。
              
              例：
              - columnGroups = [name, email, age] の場合
                → ヘッダー: [名前, メール, 年齢]
                → データ: [row.name, row.email, row.age]
              
              - columnGroups = [age, name, email] に変更した場合
                → ヘッダー: [年齢, 名前, メール]
                → データ: [row.age, row.name, row.email]  ← 自動的に順序が一致！
            */}
            {sampleData.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {columnGroups.map((group) => (
                  <React.Fragment key={group.id}>
                    {/* 
                      【最重要ポイント】Labelカラムのデータ（表示値）
                      
                      row[group.key as keyof SampleData] が核心部分です！
                      
                      この式の意味：
                      - group.key は各カラムグループのキー（例: "name", "email", "age"）
                      - row[group.key] で、そのキーに対応するデータを動的に取得
                      
                      なぜこれが重要か：
                      1. columnGroups の順序に従ってループしている
                      2. 各 group の key を使って row からデータを取得
                      3. columnGroups の順序を変更すると、取得するデータの順序も自動的に変わる
                      
                      例：
                      - columnGroups = [name, email, age] の場合
                        → row["name"], row["email"], row["age"] の順で取得
                      
                      - columnGroups = [age, name, email] に変更した場合
                        → row["age"], row["name"], row["email"] の順で取得
                        ← これにより、ヘッダーの順序とデータの順序が自動的に一致！
                      
                      「as keyof SampleData」は TypeScript の型アサーションで、
                      group.key が SampleData のプロパティ名であることを保証しています。
                    */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                      {row[group.key as keyof SampleData]}
                    </td>
                    {/* Nameカラムのデータ（内部名の表示） */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                      {group.name}
                    </td>
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-medium mb-2">現在のカラムグループ順序</h2>
          <div className="flex gap-2 flex-wrap">
            {columnGroups.map((group, index) => (
              <span
                key={group.id}
                className="px-3 py-1 bg-white rounded border text-sm"
              >
                {index + 1}. {group.label} ({group.name})
              </span>
            ))}
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-medium mb-2">保存するOrderデータ</h2>
          <pre className="bg-white p-3 rounded border text-xs overflow-x-auto">
            {JSON.stringify(order, null, 2)}
          </pre>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSaveOrder}
            disabled={isSaving}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isSaving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isSaving ? "保存中..." : "OrderをDBに保存"}
          </button>

          {saveStatus === "success" && (
            <div className="flex items-center gap-2 text-green-600">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>保存に成功しました</span>
            </div>
          )}

          {saveStatus === "error" && (
            <div className="flex items-center gap-2 text-red-600">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span>{errorMessage || "保存に失敗しました"}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
