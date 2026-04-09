/**
 * StudioHeader Component
 *
 * The top header bar of the studio interface. Contains the studio logo,
 * orientation controls, and action divs for saving and exporting.
 *
 * @component
 * @param {Object} props
 * @param {(resolution: Size) => void} props.setVideoResolution - Callback to update canvas resolution
 *
 * @example
 * ```tsx
 * <StudioHeader
 *   setVideoResolution={(size) => console.log(`New size: ${size.width}x${size.height}`)}
 * />
 * ```
 */

import type { Size } from "@twick/timeline";
import { Save, Download, File, Plus, RectangleVertical, RectangleHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

interface StudioHeaderProps {
  setVideoResolution: (resolution: Size) => void;
  onNewProject: () => void;
  onLoadProject: () => void;
  onSaveProject: () => void;
  onExportVideo: () => void;
  onExportCaptions: (format: "srt" | "vtt") => void;
  onExportChapters: (format: "youtube" | "json") => void;
}
export const StudioHeader = ({
  setVideoResolution,
  onNewProject,
  onLoadProject,
  onSaveProject,
  onExportVideo,
}: StudioHeaderProps) => {
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">(
    "vertical"
  );

  useEffect(() => {
    const orientation = localStorage.getItem("orientation");
    if (orientation) {
      setOrientation(orientation as "horizontal" | "vertical");
    }
  }, []);

  const handleOrientationChange = (nextOrientation: "horizontal" | "vertical") => {
    if (nextOrientation === orientation) return;

    const confirmMessage =
      "切换方向将以新分辨率创建新项目，是否继续？";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    // Create a fresh project for the new resolution
    onNewProject();
    setOrientation(nextOrientation);
  };

  useEffect(() => {
    if (orientation === "horizontal") {
      localStorage.setItem("orientation", "horizontal");
      setVideoResolution({ width: 1280, height: 720 });
    } else {
      localStorage.setItem("orientation", "vertical");
      setVideoResolution({ width: 720, height: 1280 });
    }
  }, [orientation]);

  return (
    <header className="header">
      <div className="flex-container">
        <div className="flex-container" style={{ gap: "0.5rem" }}>
          <span className="text-sm opacity-80">方向</span>
          <button
            className={`btn-ghost ${orientation === "vertical" ? "btn-primary" : ""}`}
            title="竖屏 (720×1280)"
            onClick={() => handleOrientationChange("vertical")}
          >
            <RectangleVertical className="icon-sm" />
          </button>
          <button
            className={`btn-ghost ${orientation === "horizontal" ? "btn-primary" : ""}`}
            title="横屏 (1280×720)"
            onClick={() => handleOrientationChange("horizontal")}
          >
            <RectangleHorizontal className="icon-sm" />
          </button>
        </div>
      </div>
      <div className="flex-container">
        <button
          className="btn-ghost"
          title="新建项目"
          onClick={onNewProject}
        >
          <Plus className="icon-sm" />
          新建项目
        </button>
        <button
          className="btn-ghost"
          title="加载项目"
          onClick={onLoadProject}
        >
          <File className="icon-sm" />
          加载项目
        </button>
        <button
          className="btn-ghost"
          title="保存草稿"
          onClick={onSaveProject}
        >
          <Save className="icon-sm" />
          保存草稿
        </button>
        <button
          className="btn-primary"
          title="导出"
          onClick={onExportVideo}
        >
          <Download className="icon-sm" />
          导出
        </button>
      </div>
    </header>
  );
};

export default StudioHeader;
