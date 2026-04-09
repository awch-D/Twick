/**
 * Toolbar Component
 * 
 * A vertical toolbar that provides quick access to different editing tools
 * and media types. Displays icons with labels and optional keyboard shortcuts.
 * 
 * @component
 * @param {Object} props
 * @param {string} props.selectedTool - Currently selected tool ID
 * @param {(tool: string) => void} props.setSelectedTool - Callback to update selected tool
 * 
 * @example
 * ```tsx
 * <Toolbar
 *   selectedTool="text"
 *   setSelectedTool={(tool) => console.log(`Selected ${tool}`)}
 * />
 * ```
 */

import { 
  Type, 
  Upload, 
  Video,
  Image, 
  Music,
  Circle,
  MessageSquare,
  Plus,
  Square,
  Wand2,
  File,
  Smile,
} from 'lucide-react'
import type { ToolCategory } from '../types'

const defaultToolCategories: ToolCategory[] = [
  // { id: 'templates', name: 'Templates', icon: 'Plus', description: 'Start from a project template' },
  // { id: 'record', name: 'Record', icon: 'Upload', description: 'Record screen and import clip' },
  { id: 'video', name: '视频', icon: 'Video', description: '添加视频元素' },
  { id: 'image', name: '图片', icon: 'Image', description: '添加图片元素' },
  { id: 'audio', name: '音频', icon: 'Audio', description: '添加音频元素' },
  { id: 'text', name: '文字', icon: 'Type', description: '添加文字元素' },
  { id: 'emoji', name: '表情', icon: 'Smile', description: '添加表情贴纸' },
  { id: 'text-style', name: '文字样式', icon: 'Type', description: '应用文字样式预设' },
  { id: 'effect', name: '特效', icon: 'Wand2', description: '应用 GL 视频特效' },
  { id: 'shape', name: '形状', icon: 'Square', description: '添加线条、箭头、方框和圆形' },
  { id: 'caption', name: '字幕', icon: 'MessageSquare', description: '管理字幕'},
  { id: 'generate-media', name: '生成', icon: 'Wand2', description: 'AI 生成图片或视频'},
]

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'Plus': return Plus
    case 'Type': return Type
    case 'Upload': return Upload
    case 'Square': return Square
    case 'Image': return Image
    case 'Video': return Video
    case 'Audio': return Music
    case 'Circle': return Circle
    case 'Rect': return Square
    case 'MessageSquare': return MessageSquare
    case 'Wand2': return Wand2
    case 'File': return File
    case 'Smile': return Smile
    default: return Plus
  }
}

export function Toolbar({
  selectedTool,
  setSelectedTool,
  customTools = [],
  hiddenTools = [],
}: {
  selectedTool: string;
  setSelectedTool: (tool: string) => void;
  customTools?: ToolCategory[];
  hiddenTools?: string[];
}) {

  const mergedTools = [...defaultToolCategories, ...customTools].filter(
    (tool) => !hiddenTools.includes(tool.id)
  );
  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId)
  }

  return (
    <div className="sidebar">
      {/* Main Tools */}
      {mergedTools.map((tool) => {
        const Icon = getIcon(tool.icon)
        const isSelected = selectedTool === tool.id
        
        const tooltipText = `${tool.name}${tool.shortcut ? ` (${tool.shortcut})` : ''}`;
        return (
          <div
            key={tool.id}
            onClick={() => handleToolSelect(tool.id)}
            className={`toolbar-btn ${isSelected ? 'active' : ''}`}
            title={tooltipText}
            data-tooltip={tooltipText}
          >
            <Icon className="icon-sm" />
            <span className="toolbar-label">
              {tool.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}
