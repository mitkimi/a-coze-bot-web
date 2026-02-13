import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4400'

export const api = {
  async getModelList(): Promise<any> {
    const response = await axios.get(`${API_BASE_URL}/model/list`)
    return response.data
  },

  async createSession(modelId?: string): Promise<any> {
    const response = await axios.post(`${API_BASE_URL}/model/create-session`, { modelId })
    return response.data
  },

  async switchModel(sessionId: string, modelId: string): Promise<any> {
    const response = await axios.post(`${API_BASE_URL}/model/${sessionId}/switch`, { modelId })
    return response.data
  },

  async getMessages(sessionId: string): Promise<any> {
    const response = await axios.get(`${API_BASE_URL}/model/${sessionId}/messages`)
    return response.data
  },

  async deleteSession(sessionId: string): Promise<any> {
    const response = await axios.post(`${API_BASE_URL}/model/${sessionId}/delete`)
    return response.data
  },
}
