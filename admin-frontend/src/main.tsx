import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

// 1. استدعاء نسخة الـ RTL لتنقلب الواجهة لليمين
import 'bootstrap/dist/css/bootstrap.rtl.min.css';
// 2. استدعاء ملف التنسيقات الخاص بنا ليتجاوز ألوان البوتستراب
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)