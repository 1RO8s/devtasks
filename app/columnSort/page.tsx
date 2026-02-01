"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

// ソート可能なカラムグループヘッダーコンポーネント（labelとnameの2カラム）
function SortableColumnGroup({ group }: { group: ColumnGroup }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // グループ全体のスタイルを適用するための共通スタイル
  const groupStyle = isDragging ? { opacity: 0.5 } : {};

  return (
    <>
      {/* Labelカラム（表示名）- ドラッグハンドル */}
      <th
        ref={setNodeRef}
        style={{ ...style, ...groupStyle }}
        {...attributes}
        {...listeners}
        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-r border-gray-200 cursor-move hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-gray-400">⋮⋮</span>
          <span>{group.label}</span>
        </div>
      </th>
      {/* Nameカラム（内部名）- グループの一部として一緒に移動 */}
      <th
        style={groupStyle}
        className="px-4 py-2 text-left text-xs font-normal text-gray-400 bg-gray-50 border-b border-gray-200"
      >
        {group.name}
      </th>
    </>
  );
}

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

export default function ColumnSortPage() {
  const [columnGroups, setColumnGroups] = useState<ColumnGroup[]>(initialColumnGroups);
  const [order, setOrder] = useState<ColumnOrder[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setColumnGroups((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
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
      <h1 className="text-2xl font-semibold mb-4">カラム並び替えサンプル</h1>
      <p className="text-gray-600 mb-6">
        テーブルヘッダーをドラッグアンドドロップしてカラムグループ（label + name）の順序を変更できます。
        各グループは表示名（label）と内部名（name）の2カラムで構成されています。
      </p>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <SortableContext
                  items={columnGroups.map((group) => group.id)}
                  strategy={horizontalListSortingStrategy}
                >
                  {columnGroups.map((group) => (
                    <SortableColumnGroup key={group.id} group={group} />
                  ))}
                </SortableContext>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sampleData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {columnGroups.map((group) => (
                    <React.Fragment key={group.id}>
                      {/* Labelカラムのデータ（表示値） */}
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
        </DndContext>
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
