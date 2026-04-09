import React, { useState } from "react";
import { TextElement, type ChapterMarker, useTimelineContext } from "@twick/timeline";
import type { PanelProps } from "../../types";

const parseSections = (script: string): string[] =>
  script
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => !!line);

export const ScriptPanel = ({ videoResolution }: PanelProps): React.ReactElement => {
  const [script, setScript] = useState("");
  const { editor } = useTimelineContext();

  const buildTimelineFromScript = async () => {
    const sections = parseSections(script);
    if (!sections.length) return;

    const chapters: ChapterMarker[] = [];
    const track = editor.addTrack("Script Outline", "element");

    for (let index = 0; index < sections.length; index++) {
      const section = sections[index];
      const start = index * 6;
      const end = start + 5;
      chapters.push({
        id: `script-chapter-${Date.now()}-${index}`,
        title: section,
        time: start,
      });
      const textElement = new TextElement(section)
        .setStart(start)
        .setEnd(end)
        .setName(`Script Section ${index + 1}`)
        .setPosition({
          x: Math.round(videoResolution.width / 2),
          y: Math.round(videoResolution.height * 0.2),
        });
      await editor.addElementToTrack(track, textElement);
    }

    const metadata = editor.getMetadata() ?? {};
    editor.setMetadata({
      ...metadata,
      chapters: [...(metadata.chapters ?? []), ...chapters],
    });
    editor.refresh();
  };

  return (
    <div className="panel-container">
      <div className="panel-header">
        <h3>脚本</h3>
      </div>
      <div className="panel-content" style={{ display: "grid", gap: "10px" }}>
        <textarea
          className="input-dark"
          rows={10}
          placeholder="粘贴脚本大纲（每行一个段落）"
          value={script}
          onChange={(e) => setScript(e.target.value)}
        />
        <button className="btn-primary" onClick={buildTimelineFromScript}>
          从大纲生成时间轴
        </button>
      </div>
    </div>
  );
};
