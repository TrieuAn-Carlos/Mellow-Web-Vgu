"use client";

import React, { useState } from "react";
import SVGIcon from "@/components/SVGIcon";
import { IconHome, IconSettings, IconUser } from "@/components/icons";

export default function IconsDemo() {
  const [svgCode, setSvgCode] = useState("");
  const [viewBox, setViewBox] = useState("0 0 24 24");
  const [iconName, setIconName] = useState("");
  const [previewColor, setPreviewColor] = useState("#3B82F6"); // blue-500

  // Tạo code cho component
  const generateComponentCode = () => {
    if (!svgCode || !iconName) return "";

    return `export const Icon${iconName}: React.FC<IconProps> = ({
  width = 24,
  height = 24,
  className = '',
  color = 'currentColor'
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="${viewBox}"
    fill="none"
    stroke={color}
    className={className}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    ${svgCode}
  </svg>
);`;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">SVG Icon Manager</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Thêm SVG mới</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên Icon (PascalCase)
            </label>
            <input
              type="text"
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
              placeholder="Ví dụ: Cart, Download, Mail..."
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ViewBox (tùy chọn)
            </label>
            <input
              type="text"
              value={viewBox}
              onChange={(e) => setViewBox(e.target.value)}
              placeholder="0 0 24 24"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mã SVG (chỉ phần path/circle/rect...)
            </label>
            <textarea
              value={svgCode}
              onChange={(e) => setSvgCode(e.target.value)}
              placeholder="<path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' />"
              rows={5}
              className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Màu xem trước
            </label>
            <input
              type="color"
              value={previewColor}
              onChange={(e) => setPreviewColor(e.target.value)}
              className="p-1 border border-gray-300 rounded-md w-24 h-10"
            />
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Xem trước</h2>

          <div
            className="mb-4 p-4 bg-gray-100 rounded-lg flex justify-center items-center"
            style={{ minHeight: "100px" }}
          >
            {svgCode ? (
              <SVGIcon
                svg={svgCode}
                width={48}
                height={48}
                color={previewColor}
                viewBox={viewBox}
              />
            ) : (
              <p className="text-gray-500 italic">Icon sẽ hiển thị ở đây</p>
            )}
          </div>

          <h3 className="font-medium mb-2">Component Code:</h3>
          <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto text-sm">
            {generateComponentCode() ||
              "// Nhập mã SVG và tên để tạo component"}
          </pre>
        </div>
      </div>

      <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Icons có sẵn</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <div className="p-4 border rounded-md flex flex-col items-center">
            <IconHome width={32} height={32} color="#3B82F6" />
            <span className="mt-2 text-sm">IconHome</span>
          </div>
          <div className="p-4 border rounded-md flex flex-col items-center">
            <IconUser width={32} height={32} color="#3B82F6" />
            <span className="mt-2 text-sm">IconUser</span>
          </div>
          <div className="p-4 border rounded-md flex flex-col items-center">
            <IconSettings width={32} height={32} color="#3B82F6" />
            <span className="mt-2 text-sm">IconSettings</span>
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Hướng dẫn sử dụng</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Để thêm SVG mới, nhập mã SVG và tên vào form bên trên</li>
          <li>Copy mã component được tạo ra</li>
          <li>
            Mở file{" "}
            <code className="bg-gray-100 px-1 py-0.5 rounded">
              src/components/icons/index.tsx
            </code>
          </li>
          <li>Thêm component mới vào cuối file và export nó</li>
          <li>
            Sử dụng icon trong ứng dụng:
            <br />
            <code className="bg-gray-100 px-1 py-0.5 rounded">
              import {"{"} IconName {"}"} from '@/components/icons';
            </code>
            <br />
            <code className="bg-gray-100 px-1 py-0.5 rounded">{`<IconName width={24} height={24} className="text-blue-500" />`}</code>
          </li>
        </ol>
      </div>
    </div>
  );
}
