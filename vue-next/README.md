# 前端

把 `/src/components/Cozebot` 拷贝到项目中，按照正常的 Vue 组件使用即可

```html
<coze-bot placeholder="Say something" />
```

## Props
| 字段 | 含义 | 数据类型 | 可选值 | 默认值 | 备注 |
| theme | 主题 | String | light/dark | light |  |
| show | 是否显示 | Boolean | - | true |  |
| placeholder | 输入框的提示文字 | String | - | - |  |
| assistant | AI 助理信息 | Object | - | 见下表 |  |

```json
{
  "headImgUrl": "头像 url",
  "name": "AI 助理名字",
  "bio": "AI 助理个性签名"
}
```