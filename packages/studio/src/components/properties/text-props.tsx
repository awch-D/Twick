import { TextElement } from "@twick/timeline";
import type { PropertiesPanelProps } from "../../types";
import { AccordionItem } from "../shared/accordion-item";
import { PropertyRow } from "./property-row";
import { Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic } from "lucide-react";
import { useState } from "react";

export function TextPropsPanel({
  selectedElement,
  updateElement,
}: PropertiesPanelProps) {
  if (!(selectedElement instanceof TextElement)) return null;

  const textProps = selectedElement.getProps() || {};

  const [isTypographyOpen, setIsTypographyOpen] = useState(false);

  const currentAlign = textProps.textAlign ?? "center";
  const currentWeight = textProps.fontWeight ?? 400;
  const isBold = currentWeight >= 600;
  const isItalic = textProps.fontStyle === "italic";

  const handleUpdate = (patch: Partial<typeof textProps>) => {
    if (!selectedElement) return;
    const next = { ...textProps, ...patch };
    selectedElement.setProps(next);
    updateElement?.(selectedElement);
  };

  const toggleBold = () => {
    handleUpdate({ fontWeight: isBold ? 400 : 700 });
  };

  const toggleItalic = () => {
    handleUpdate({ fontStyle: isItalic ? "normal" : "italic" });
  };

  const setAlign = (align: "left" | "center" | "right") => {
    handleUpdate({ textAlign: align });
  };

  return (
    <div className="panel-container">
      <div className="panel-title">排版</div>
      <AccordionItem
        title="排版"
        icon={<Type className="icon-sm" />}
        isOpen={isTypographyOpen}
        onToggle={() => setIsTypographyOpen((open) => !open)}
      >
        <div className="properties-group">
          {/* Font size */}
          <div className="property-section">
            <PropertyRow
              label="字号"
              secondary={<span>{textProps.fontSize ?? 48}px</span>}
            >
              <input
                type="range"
                min={8}
                max={160}
                value={textProps.fontSize ?? 48}
                onChange={(e) =>
                  handleUpdate({ fontSize: Number(e.target.value) })
                }
                className="slider-purple"
              />
            </PropertyRow>
          </div>

          {/* Style: bold / italic */}
          <div className="property-section">
            <PropertyRow label="样式">
              <button
                type="button"
                className={`form-btn ${isBold ? "active" : ""}`}
                onClick={toggleBold}
                title="粗体"
              >
                <Bold className="icon-sm" />
              </button>
              <button
                type="button"
                className={`form-btn ${isItalic ? "active" : ""}`}
                onClick={toggleItalic}
                title="斜体"
              >
                <Italic className="icon-sm" />
              </button>
            </PropertyRow>
          </div>

          {/* Alignment */}
          <div className="property-section">
            <PropertyRow label="对齐">
              <button
                type="button"
                className={`form-btn ${currentAlign === "left" ? "active" : ""}`}
                onClick={() => setAlign("left")}
                title="左对齐"
              >
                <AlignLeft className="icon-sm" />
              </button>
              <button
                type="button"
                className={`form-btn ${
                  currentAlign === "center" ? "active" : ""
                }`}
                onClick={() => setAlign("center")}
                title="居中对齐"
              >
                <AlignCenter className="icon-sm" />
              </button>
              <button
                type="button"
                className={`form-btn ${
                  currentAlign === "right" ? "active" : ""
                }`}
                onClick={() => setAlign("right")}
                title="右对齐"
              >
                <AlignRight className="icon-sm" />
              </button>
            </PropertyRow>
          </div>

        </div>
      </AccordionItem>
    </div>
  );
}

