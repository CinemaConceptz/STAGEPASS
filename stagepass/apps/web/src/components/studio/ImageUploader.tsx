"use client";

import { useRef, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import Button from "@/components/ui/Button";

interface ImageUploaderProps {
  value: string;
  onChange: (dataUrl: string) => void;
  label?: string;
  className?: string;
}

export default function ImageUploader({ value, onChange, label, className }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onChange(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        data-testid="image-upload-input"
      />
      <div className="flex items-start gap-4">
        <div
          className={`h-24 w-24 bg-black/30 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border-2 transition-colors cursor-pointer ${
            dragOver ? "border-stage-mint" : value ? "border-white/10" : "border-dashed border-white/20"
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          data-testid="image-upload-dropzone"
        >
          {value ? (
            <img src={value} alt={label || "Upload"} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center">
              <Upload size={20} className="mx-auto text-stage-mutetext/40 mb-1" />
              <span className="text-[10px] text-stage-mutetext/40">Click or drop</span>
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => inputRef.current?.click()}
              data-testid="image-upload-btn"
            >
              <Upload size={14} className="mr-1.5" />
              {value ? "Change Image" : "Upload Image"}
            </Button>
            {value && (
              <button
                onClick={() => onChange("")}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
                data-testid="image-upload-remove"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <p className="text-xs text-stage-mutetext">
            {label || "PNG, JPG, or WebP. Max 5MB."}
          </p>
        </div>
      </div>
    </div>
  );
}
