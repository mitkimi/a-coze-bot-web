import React from 'react'
import { Select } from '@apron-design/react'
import { ModelInfo } from '../../types'
import './ModelSelector.css'

interface ModelSelectorProps {
  models: ModelInfo[]
  currentModel: string
  onModelChange: (modelId: string) => void
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  currentModel,
  onModelChange,
}) => {
  const currentModelInfo = models.find(m => m.id === currentModel)

  return (
    <div className="model-selector">
      <span className="model-selector-label">当前模型：</span>
      <Select
        value={currentModel}
        onChange={onModelChange}
        placeholder="选择模型"
        style={{ width: 200 }}
      >
        {models.map(model => (
          <Select.Option key={model.id} value={model.id} disabled={!model.enabled}>
            {model.name}
          </Select.Option>
        ))}
      </Select>
      {currentModelInfo && (
        <span className="model-provider">
          {currentModelInfo.provider.toUpperCase()}
        </span>
      )}
    </div>
  )
}

export default ModelSelector
