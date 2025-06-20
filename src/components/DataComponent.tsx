"use client";

import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface DataItem {
  id: string;
  message: string;
  timestamp: any;
}

export default function DataComponent() {
  const [items, setItems] = useState<DataItem[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Lấy dữ liệu từ Firestore
  const fetchData = async () => {
    try {
      const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as DataItem[];
      setItems(data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    }
  };

  // Thêm dữ liệu mới
  const addData = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "messages"), {
        message: newMessage,
        timestamp: new Date(),
      });
      setNewMessage("");
      await fetchData(); // Refresh dữ liệu
    } catch (error) {
      console.error("Lỗi khi thêm dữ liệu:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Firebase Firestore Demo
      </h2>

      {/* Form thêm dữ liệu */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addData}
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang thêm..." : "Thêm"}
          </button>
        </div>
      </div>

      {/* Hiển thị dữ liệu */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-700">
          Danh sách tin nhắn:
        </h3>
        {items.length === 0 ? (
          <p className="text-gray-500 italic">Chưa có tin nhắn nào</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="p-4 bg-gray-50 rounded-lg border">
                <p className="text-gray-800">{item.message}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {item.timestamp?.toDate?.()?.toLocaleString() ||
                    "Không có thời gian"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={fetchData}
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
      >
        Làm mới dữ liệu
      </button>
    </div>
  );
}
