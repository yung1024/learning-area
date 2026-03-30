const data = {
  nodes: [
    {
      id: "node-1",
      title: "节点一：迷雾森林入口",
      description: "你站在森林入口，夜色将至，前方只有两条路。",
      image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1280&h=720&q=80",
      choices: [
        {
          text: "走向有灯光的小屋",
          image: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=960&h=540&q=80",
          target: "#node-2"
        },
        {
          text: "沿河流继续前进",
          image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=960&h=540&q=80",
          target: "#node-3"
        }
      ]
    },
    {
      id: "node-2",
      title: "节点二：沉睡小屋",
      description: "小屋门微开，里面传来机械运作的低鸣。",
      image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1280&h=720&q=80",
      choices: [
        {
          text: "打开地下室活板门",
          image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=960&h=540&q=80",
          target: "#ending-a"
        },
        {
          text: "回到森林入口",
          image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=960&h=540&q=80",
          target: "#node-1"
        }
      ]
    },
    {
      id: "node-3",
      title: "节点三：月光河谷",
      description: "河面反光像一张地图，你发现两种不同的过河方式。",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1280&h=720&q=80",
      choices: [
        {
          text: "乘坐旧木筏",
          image: "https://images.unsplash.com/photo-1500930287596-c1ecaa373bb2?auto=format&fit=crop&w=960&h=540&q=80",
          target: "#ending-b"
        },
        {
          text: "踏石而行",
          image: "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=960&h=540&q=80",
          target: "#ending-c"
        }
      ]
    }
  ],
  endings: [
    {
      id: "ending-a",
      title: "结局 A：机关核心",
      description: "你解开了小屋地下的机关，找到失落的城镇能源核心。"
    },
    {
      id: "ending-b",
      title: "结局 B：顺流远航",
      description: "木筏将你带离森林，你在天亮前抵达新的港口。"
    },
    {
      id: "ending-c",
      title: "结局 C：石桥试炼",
      description: "你跨过险石，获得守桥者认可，故事进入隐藏章节。"
    }
  ]
};

const editorRoot = document.querySelector("#editorRoot");
const storyRoot = document.querySelector("#storyRoot");
const renderBtn = document.querySelector("#renderBtn");
const nodeEditorTemplate = document.querySelector("#nodeEditorTemplate");
const choiceEditorTemplate = document.querySelector("#choiceEditorTemplate");

function makeNodeEditor(node, nodeIndex) {
  const fragment = nodeEditorTemplate.content.cloneNode(true);
  const block = fragment.querySelector(".editor-block");
  const legend = block.querySelector("legend");
  legend.textContent = `节点 ${nodeIndex + 1}`;

  const nodeFields = block.querySelectorAll("[data-field]");
  nodeFields.forEach((field) => {
    const key = field.dataset.field;
    field.value = node[key];
    field.addEventListener("input", (event) => {
      node[key] = event.target.value;
    });
  });

  const choiceEditors = block.querySelector(".choice-editors");

  node.choices.forEach((choice, choiceIndex) => {
    const choiceFragment = choiceEditorTemplate.content.cloneNode(true);
    const choiceBlock = choiceFragment.querySelector(".choice-block");
    const choiceLegend = choiceBlock.querySelector("legend");
    choiceLegend.textContent = `选项 ${choiceIndex + 1}`;

    choiceBlock.querySelectorAll("[data-field]").forEach((field) => {
      const key = field.dataset.field;
      field.value = choice[key];
      field.addEventListener("input", (event) => {
        choice[key] = event.target.value;
      });
    });

    choiceEditors.append(choiceFragment);
  });

  return fragment;
}

function renderEditor() {
  editorRoot.innerHTML = "";
  data.nodes.forEach((node, index) => {
    editorRoot.append(makeNodeEditor(node, index));
  });
}

function renderStory() {
  storyRoot.innerHTML = "";

  data.nodes.forEach((node) => {
    const nodeSection = document.createElement("article");
    nodeSection.className = "story-node";
    nodeSection.id = node.id;

    nodeSection.innerHTML = `
      <h3>${node.title}</h3>
      <img class="media-16x9" src="${node.image}" alt="${node.title} 配图" />
      <p>${node.description}</p>
      <div class="choice-grid">
        ${node.choices
          .map(
            (choice) => `
          <a class="choice-card" href="${choice.target}">
            <img class="media-16x9" src="${choice.image}" alt="${choice.text} 配图" />
            <span>${choice.text}</span>
          </a>
        `
          )
          .join("")}
      </div>
    `;

    storyRoot.append(nodeSection);
  });

  data.endings.forEach((ending) => {
    const endSection = document.createElement("article");
    endSection.className = "story-ending";
    endSection.id = ending.id;
    endSection.innerHTML = `
      <h3>${ending.title}</h3>
      <p>${ending.description}</p>
      <a href="#node-1">回到开头</a>
    `;
    storyRoot.append(endSection);
  });
}

renderBtn.addEventListener("click", renderStory);

renderEditor();
renderStory();
