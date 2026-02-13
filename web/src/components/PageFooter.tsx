import React from 'react'
import './PageFooter.css'

const PageFooter: React.FC = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="page-footer">
      <div className="page-footer-container">
        <div className="page-footer-content">
          <div className="page-footer-section">
            <span className="page-footer-label">生态系统</span>
            <div className="page-footer-links">
              <a href="https://lab.mitkimi.com" target="_blank" rel="noopener noreferrer">
                MITKIMI Lab
              </a>
              <span className="page-footer-separator">|</span>
              <a href="https://agent.mitkimi.com" target="_blank" rel="noopener noreferrer">
                AI 助手
              </a>
            </div>
          </div>

          <div className="page-footer-section">
            <span className="page-footer-label">文档</span>
            <div className="page-footer-links">
              <a href="#">使用指南</a>
              <span className="page-footer-separator">|</span>
              <a href="#">API 文档</a>
              <span className="page-footer-separator">|</span>
              <a href="#">常见问题</a>
              <span className="page-footer-separator">|</span>
              <a href="#">用户协议</a>
              <span className="page-footer-separator">|</span>
              <a href="#">隐私政策</a>
            </div>
          </div>
        </div>

        <div className="page-footer-bottom">
          <div className="page-footer-bottom-left">
            © Copyright {currentYear} Coze Bot. All rights reserved.
          </div>
          <div className="page-footer-bottom-right">
            <a href="https://open.mitkimi.com" target="_blank" rel="noopener noreferrer">
              open.mitkimi.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default PageFooter
