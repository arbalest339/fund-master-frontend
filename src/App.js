import React, { useState } from "react";
import { Descriptions, Table, Popover } from "antd";
import Chat, {
  Text,
  Tabs,
  Tab,
  Tag,
  Bubble,
  Button,
  Icon,
  Popup,
  List,
  ListItem,
  useMessages
} from "@chatui/core";
import { StarTwoTone, QuestionCircleOutlined } from "@ant-design/icons";
import ReactECharts from "echarts-for-react";
import "@chatui/core/dist/index.css";
import "antd/dist/antd.css";
import "./App.css";

const dialogue = require("./static/dialogue.json"); // forward slashes will depend on the file location
const fundsInfo = require("./static/funds.json");
var initialMessages = [];
var dlgIdx = 0;

for (dlgIdx = 0; dlgIdx < dialogue.length; dlgIdx++) {
  if (dialogue[dlgIdx].initFlag) {
    initialMessages.push(dialogue[dlgIdx]);
  } else break;
}

// const { Header, Footer, Sider, Content } = Layout;

// 默认快捷短语，可选
var defaultQuickReplies = [
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

var fundDetail = fundsInfo["000355"];

export default function App() {
  // 消息列表
  const { messages, appendMsg, setTyping } = useMessages(initialMessages);
  const [open, setOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const { Column } = Table;

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
    console.log(fundsInfo[key].performance.return);
    fundDetail = fundsInfo[key];
    setOpen(true);
  }

  function handleClosePopup(item) {
    setOpen(false);
  }

  function handleTabChange(i) {
    setTabIndex(i);
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
            // <StarFilled key={i} width="2em" height="2em" color="gold" />
            <StarTwoTone
              key={i}
              style={{ fontSize: "200%" }}
              twoToneColor="gold"
            />
          );
        }

        return (
          <Bubble key={fund.key}>
            <b style={{ fontSize: "20px" }}>
              {fund.key + " " + fund.name}
              <div style={{ float: "right" }}>
                <Tag>京选好基</Tag>
              </div>
            </b>
            <br />
            <Descriptions
              layout="vertical"
              style={{ width: "400px" }}
              column={{ md: 2 }}
            >
              <Descriptions.Item
                label={<p className="weak">三年年化</p>}
                contentStyle={{ color: "red", fontSize: "30px" }}
              >
                {fund.triYearIncrease} %
              </Descriptions.Item>
              <Descriptions.Item label={<p className="weak">晨星评级</p>}>
                {stars}
              </Descriptions.Item>
            </Descriptions>
            <div style={{ display: "flex" }}>
              <p style={{ fontSize: "17px" }}>{fund.desc}</p>
              <Button
                color="primary"
                onClick={(e) => handleDetailClick(e, fund.key)}
                style={{ marginLeft: "auto" }}
              >
                查看详情
              </Button>
            </div>
          </Bubble>
        );

      default:
        return null;
    }
  }

  return (
    <>
      <Chat
        navbar={{ title: "智能助理" }}
        messages={messages}
        renderMessageContent={renderMessageContent}
        quickReplies={defaultQuickReplies}
        onQuickReplyClick={handleQuickReplyClick}
        onSend={handleSend}
      />
      {/* 用上拉框实现基金的详情展示 */}
      <Popup active={open} title="基金详情" onClose={handleClosePopup}>
        <b className="leftMargin" style={{ fontSize: "20px" }}>
          {fundDetail.shortName + "(" + fundDetail.code + ")"}
        </b>
        <Tag>京选好基</Tag>
        <Descriptions
          className="leftMargin"
          layout="vertical"
          column={{ md: 2 }}
        >
          <Descriptions.Item label={<p className="weak">类型</p>}>
            <Tag style={{ fontSize: "15px" }}>{fundDetail.riskLevel}</Tag>
            <Tag style={{ fontSize: "15px" }}>{fundDetail.fundType}</Tag>
          </Descriptions.Item>
          <Descriptions.Item
            label={<p className="weak">最新净值</p>}
            contentStyle={{ color: "red", fontSize: "30px" }}
          >
            <Text style={{ color: "red" }}>{fundDetail.netValue} %</Text>
          </Descriptions.Item>
        </Descriptions>
        <Tabs index={tabIndex} scrollable onChange={handleTabChange}>
          <Tab label={<p className="weak">业绩</p>}>
            <b className="leftMargin" style={{ fontSize: "20px" }}>
              阶段业绩
            </b>
            <hr />
            <Table dataSource={fundDetail.performance.return}>
              <Column title="时间" dataIndex="time" key="time" />
              <Column
                title="本基金收益"
                dataIndex="thisReturn"
                key="thisReturn"
                render={(text) => <Text style={{ color: "red" }}>{text}</Text>}
              />
              <Column title="同类平均" dataIndex="avgReturn" key="avgReturn" />
            </Table>
            <b className="leftMargin" style={{ fontSize: "20px" }}>
              特色数据
            </b>
            <hr />
            <Descriptions
              className="leftMargin"
              layout="vertical"
              column={{ md: 3 }}
            >
              <Descriptions.Item
                label={
                  <div style={{ color: "grey" }}>
                    {fundDetail.performance.other[0].desc}{" "}
                    <Popover
                      content={
                        <div style={{ width: "200px" }}>
                          {fundDetail.performance.other[0].intro}
                        </div>
                      }
                      title={fundDetail.performance.other[0].desc}
                    >
                      <QuestionCircleOutlined />
                    </Popover>
                  </div>
                }
                contentStyle={{ color: "red", fontSize: "30px" }}
              >
                {fundDetail.performance.other[0].value}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <div style={{ color: "grey" }}>
                    {fundDetail.performance.other[1].desc}{" "}
                    <Popover
                      content={
                        <div style={{ width: "200px" }}>
                          {fundDetail.performance.other[1].intro}
                        </div>
                      }
                      title={fundDetail.performance.other[1].desc}
                    >
                      <QuestionCircleOutlined />
                    </Popover>
                  </div>
                }
                contentStyle={{ color: "red", fontSize: "30px" }}
              >
                {fundDetail.performance.other[1].value}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <div style={{ color: "grey" }}>
                    {fundDetail.performance.other[2].desc}{" "}
                    <Popover
                      content={
                        <div style={{ width: "200px" }}>
                          {fundDetail.performance.other[2].intro}
                        </div>
                      }
                      title={fundDetail.performance.other[2].desc}
                    >
                      <QuestionCircleOutlined />
                    </Popover>
                  </div>
                }
                contentStyle={{ color: "red", fontSize: "30px" }}
              >
                {fundDetail.performance.other[2].value}
              </Descriptions.Item>
            </Descriptions>
          </Tab>
          <Tab label="概况">
            <b className="leftMargin" style={{ fontSize: "20px" }}>
              基金介绍
            </b>
            <hr />
            <Descriptions layout="vertical" bordered>
              <Descriptions.Item
                label={fundDetail.informations.introduction[0].desc}
              >
                <b>{fundDetail.informations.introduction[0].value}</b>
              </Descriptions.Item>
              <Descriptions.Item
                label={fundDetail.informations.introduction[1].desc}
              >
                <b>{fundDetail.informations.introduction[1].value}</b>
              </Descriptions.Item>
              <Descriptions.Item
                label={fundDetail.informations.introduction[2].desc}
              >
                <b>{fundDetail.informations.introduction[2].value}</b>
              </Descriptions.Item>
              <Descriptions.Item
                label={fundDetail.informations.introduction[3].desc}
              >
                <b>{fundDetail.informations.introduction[3].value}</b>
              </Descriptions.Item>
              <Descriptions.Item
                label={fundDetail.informations.introduction[4].desc}
              >
                <b>{fundDetail.informations.introduction[4].value}</b>
              </Descriptions.Item>
            </Descriptions>
            <br />
            <b className="leftMargin" style={{ fontSize: "20px" }}>
              基金经理
            </b>
            <hr />
            <b className="leftMargin" style={{ fontSize: "18px" }}>
              {fundDetail.informations.fundManager[0].desc}
            </b>
            <div className="leftMargin">
              {fundDetail.informations.fundManager[0].value}
            </div>
            <br />
            <Descriptions
              className="leftMargin"
              layout="vertical"
              column={{ md: 2 }}
            >
              <Descriptions.Item
                label={
                  <p className="weak">
                    {fundDetail.informations.fundManager[1].desc}
                  </p>
                }
                contentStyle={{ fontSize: "20px" }}
              >
                {fundDetail.informations.fundManager[1].value}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <p className="weak">
                    {fundDetail.informations.fundManager[2].desc}
                  </p>
                }
                contentStyle={{ color: "red", fontSize: "30px" }}
              >
                {fundDetail.informations.fundManager[2].value}
              </Descriptions.Item>
            </Descriptions>
            <b className="leftMargin" style={{ fontSize: "20px" }}>
              基金公司
            </b>
            <hr />
            <b className="leftMargin" style={{ fontSize: "18px" }}>
              {fundDetail.informations.fundCompany[0]}
            </b>
            <br />
            <Descriptions
              className="leftMargin"
              layout="vertical"
              column={{ md: 2 }}
            >
              <Descriptions.Item
                label={
                  <p className="weak">
                    {fundDetail.informations.fundCompany[1].desc}
                  </p>
                }
              >
                {fundDetail.informations.fundCompany[1].value}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <p className="weak">
                    {fundDetail.informations.fundCompany[2].desc}
                  </p>
                }
              >
                {fundDetail.informations.fundCompany[2].value}
              </Descriptions.Item>
            </Descriptions>
          </Tab>
          <Tab label="持仓">
            <ReactECharts
              className="leftMargin"
              option={fundDetail.hold}
              style={{ height: 200 }}
              // onChartReady={onChartReady}
              // onEvents={{
              //   click: onChartClick,
              //   legendselectchanged: onChartLegendselectchanged
              // }}
            />
          </Tab>
        </Tabs>
      </Popup>
    </>
  );
}
