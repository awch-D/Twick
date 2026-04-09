import { COLOR_FILTERS } from "@twick/media-utils";
import {
  ImageElement,
  VideoElement,
  type TrackElement,
} from "@twick/timeline";
import type { PropertiesPanelProps } from "../../types";
import { AccordionItem } from "../shared/accordion-item";
import { PropertyRow } from "./property-row";
import { Filter } from "lucide-react";
import { useMemo, useState } from "react";

const NONE_VALUE = "none";

const FILTER_LABELS: Record<string, string> = {
  [NONE_VALUE]: "无",
  [COLOR_FILTERS.SATURATED]: "饱和",
  [COLOR_FILTERS.BRIGHT]: "明亮",
  [COLOR_FILTERS.VIBRANT]: "鲜艳",
  [COLOR_FILTERS.RETRO]: "复古",
  [COLOR_FILTERS.BLACK_WHITE]: "黑白",
  [COLOR_FILTERS.SEPIA]: "棕褐",
  [COLOR_FILTERS.COOL]: "冷色",
  [COLOR_FILTERS.WARM]: "暖色",
  [COLOR_FILTERS.CINEMATIC]: "电影感",
  [COLOR_FILTERS.SOFT_GLOW]: "柔光",
  [COLOR_FILTERS.MOODY]: "情绪",
  [COLOR_FILTERS.DREAMY]: "梦幻",
  [COLOR_FILTERS.INVERTED]: "反色",
  [COLOR_FILTERS.VINTAGE]: "老照片",
  [COLOR_FILTERS.DRAMATIC]: "戏剧",
  [COLOR_FILTERS.FADED]: "褪色",
};

type MediaFilterElement = VideoElement | ImageElement;

function isMediaFilterElement(
  el: TrackElement | null | undefined
): el is MediaFilterElement {
  return el instanceof VideoElement || el instanceof ImageElement;
}

export function ColorFilterPropsPanel({
  selectedElement,
  updateElement,
}: PropertiesPanelProps) {
  const mediaEl = isMediaFilterElement(selectedElement) ? selectedElement : null;

  type FilterValue = (typeof COLOR_FILTERS)[keyof typeof COLOR_FILTERS];

  const options = useMemo(() => {
    const entries = (Object.values(COLOR_FILTERS) as FilterValue[]).map(
      (value) => ({
        value,
        label: FILTER_LABELS[value] ?? value,
      })
    );
    return [{ value: NONE_VALUE, label: FILTER_LABELS[NONE_VALUE] }, ...entries];
  }, []);

  const elementProps = mediaEl?.getProps() ?? {};
  const mediaFilter = elementProps.mediaFilter ?? NONE_VALUE;

  const handleFilterChange = (value: string) => {
    if (!mediaEl || !updateElement) return;
    const allowed = Object.values(COLOR_FILTERS) as string[];
    const next =
      value === NONE_VALUE
        ? NONE_VALUE
        : allowed.includes(value)
          ? value
          : NONE_VALUE;
    updateElement(
      mediaEl.setProps({
        ...elementProps,
        mediaFilter: next,
      })
    );
  };

  const [isOpen, setIsOpen] = useState(false);

  if (!mediaEl) {
    return null;
  }

  return (
    <div className="panel-container">
      <div className="panel-title">滤镜</div>
      <AccordionItem
        title="色彩滤镜"
        icon={<Filter className="icon-sm" />}
        isOpen={isOpen}
        onToggle={() => setIsOpen((open) => !open)}
      >
        <div className="properties-group">
          <div className="property-section">
            <PropertyRow label="预设">
              <select
                value={
                  options.some((o) => o.value === mediaFilter)
                    ? mediaFilter
                    : NONE_VALUE
                }
                onChange={(e) => handleFilterChange(e.target.value)}
                className="select-dark w-full"
              >
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </PropertyRow>
          </div>
        </div>
      </AccordionItem>
    </div>
  );
}
