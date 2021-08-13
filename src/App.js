import React, { useState } from "react";
import { Descriptions } from "antd";
import Chat, {
  Text,
  Bubble,
  Button,
  Popup,
  List,
  ListItem,
  useMessages
} from "@chatui/core";
import { StarTwoTone } from "@ant-design/icons";
import "@chatui/core/dist/index.css";
import "./App.css";

var dialogue = require("./static/dialogue.json"); // forward slashes will depend on the file location
var initialMessages = [];
var dlgIdx = 0;

for (dlgIdx = 0; dlgIdx < dialogue.length; dlgIdx++) {
  if (dialogue[dlgIdx].initFlag) {
    initialMessages.push(dialogue[dlgIdx]);
  } else break;
}

// 默认快捷短语，可选
const defaultQuickReplies = [
  {
    icon: "message",
    name: "联系人工服务",
    isHighlight: true
  },
  {
    icon: "message",
    name: "什么是指数型基金？"
    // isNew: true
  },
  {
    icon: "message",
    name: "什么是定投？"
    // isHighlight: true
  },
  {
    icon: "message",
    name: "帮我推荐基金",
    isNew: true,
    isHighlight: true
  }
];

export default function App() {
  // 消息列表
  const { messages, appendMsg, setTyping } = useMessages(initialMessages);
  const [open, setOpen] = useState(false);

  // 发送回调
  function handleSend(type, val) {
    if (val.trim()) {
      // 输出用户的输入
      appendMsg({
        type: "text",
        content: { text: val },
        position: "right"
      });
      // 延时动画
      setTyping(true);

      if (type === "text") {
        // 用户直接在输入框的输入
        setTimeout(() => {
          appendMsg({
            type: "text",
            content: { text: "亲，您的问题好深奥哦，我听不懂QAQ" }
          });
        }, 1000);
      } else if (type === "choose") {
        // 用户点击选项按钮，且不是最后一个选择
        setTimeout(() => {
          appendMsg(dialogue[dlgIdx]);
          dlgIdx++;
          appendMsg(dialogue[dlgIdx]);
          dlgIdx++;
        }, 1000);
      } else if (type === "decide") {
        // 用户点击选项按钮，且不是最后一个选择
        setTimeout(() => {
          for (dlgIdx; dlgIdx < dialogue.length; dlgIdx++) {
            appendMsg(dialogue[dlgIdx]);
          }
        }, 1000);
      }
    }
  }

  // 快捷短语回调，可根据 item 数据做出不同的操作，这里以发送文本消息为例
  function handleQuickReplyClick(item) {
    handleSend("text", item.name, "");
  }

  function handleChooseClick(item) {
    handleSend("choose", item.target.innerText, "");
  }

  function handleDecideClick(item) {
    handleSend("decide", item.target.innerText, "");
  }

  function handleDetailClick(item, key) {
    console.log(open);
    setOpen(true);
    console.log(open);
  }

  function handleClosePopup(item) {
    setOpen(false);
  }

  function renderMessageContent(msg) {
    const { type, content } = msg;

    // 根据消息类型来渲染
    switch (type) {
      case "text":
        return <Bubble content={content.text} />;
      case "image":
        return (
          <Bubble type="image">
            <img src={content.picUrl} alt="" />
          </Bubble>
        );
      case "choice":
        let choices = content.choices.map((choice) => {
          if (msg.lastFlag) {
            return (
              <ListItem key={choice.key}>
                <Button color="primary" onClick={handleDecideClick}>
                  {choice.value}
                </Button>
              </ListItem>
            );
          } else {
            return (
              <ListItem key={choice.key}>
                <Button color="primary" onClick={handleChooseClick}>
                  {choice.value}
                </Button>
              </ListItem>
            );
          }
        });
        return (
          <Bubble>
            <List>{choices}</List>
          </Bubble>
        );
      case "fundList":
        let fund = content.fund;
        var stars = [];
        for (let i = 0; i < fund.morningStar; i++) {
          stars.push(
            <StarTwoTone key={i} fontSize="1px" twoToneColor="gold" />
          );
        }

        return (
          <Bubble key={fund.key}>
            <Descriptions title={fund.key + " " + fund.name} layout="vertical">
              {/* {fund.desc} */}
              <Descriptions.Item label="三年年化">
                <Text style={{ color: "red" }}>{fund.triYearIncrease} %</Text>
              </Descriptions.Item>
              <Descriptions.Item label="晨星评级">{stars}</Descriptions.Item>
            </Descriptions>
            <Text>{fund.desc}</Text>
            <Button
              color="primary"
              onClick={(e) => handleDetailClick(e, fund.key)}
            >
              查看详情
            </Button>
          </Bubble>
        );

      default:
        return null;
    }
  }

  return (
    <div>
      <Chat
        navbar={{ title: "智能助理" }}
        messages={messages}
        renderMessageContent={renderMessageContent}
        quickReplies={defaultQuickReplies}
        onQuickReplyClick={handleQuickReplyClick}
        onSend={handleSend}
      />
      <Popup active={open} title="标题" onClose={handleClosePopup}>
        <div style={{ padding: "0px 15px" }}>
          <p style={{ padding: "10px" }}>
            内容详情内容详情内容详情内容详情内容详情内容详情
          </p>
          <p style={{ padding: "10px" }}>
            内容详情内容详情内容详情内容详情内容详情
          </p>
        </div>
      </Popup>
    </div>
    
  );
}
