"use strict";
(() => {
  const CATALOG = [
    {
      id: "degree",
      name: "程度",
      items: [
        "轻度（拍灰）",
        "轻中度（发肿）",
        "中度（硬块）",
        "中重度（淤紫）",
        "重度（破皮）",
      ],
    },
    {
      id: "type",
      name: "类型",
      items: [
        "纯实践",
        "惩戒管教",
        "剧情演绎",
        "捆绑固定",
        "反主",
      ],
    },
    {
      id: "body",
      name: "部位",
      items: [
        "臀部",
        "臀缝",
        "大腿后侧",
        "大腿前侧",
        "小腿",
        "手心",
        "脚心",
        "背部",
        "面部",
      ],
    },
    {
      id: "tool",
      name: "工具",
      items: [
        "巴掌",
        "戒尺",
        "皮具",
        "藤条",
        "小红",
        "板子",
        "橡胶类",
        "亚克力类",
        "发刷",
        "散鞭",
        "长鞭",
        "数据线",
      ],
    },
    {
      id: "position",
      name: "姿势",
      items: [
        "OTK",
        "平趴",
        "跪趴",
        "跪立",
        "趴桌子",
        "趴床边",
        "站立扶墙",
        "站立扶腿",
        "尿布式",
      ],
    },
    {
      id: "feeling",
      name: "氛围",
      items: ["仪式感", "羞耻感", "压迫感", "控制感", "不安感", "服从感"],
    },
    {
      id: "other",
      name: "其他",
      items: [
        "罚站",
        "罚跪",
        "写检讨",
        "罚抄写",
        "姜罚",
        "晾臀",
        "aftercare",
        "请罚",
        "多人实践",
        "责罚期",
        "正装",
        "cosplay",
        "回锅",
        "实践日记",
        "喜欢余痛",
      ],
    },
  ];
  CATALOG.forEach(
    (category) =>
      (category.items = category.items.map((name, index) => ({
        id: category.id + "-" + String(index + 1).padStart(2, "0"),
        name,
      }))),
  );
  const STATES = ["empty", "low", "medium", "high", "full", "reject"];
  const STATE_NAMES = {
    empty: "空",
    low: "低",
    medium: "中",
    high: "高",
    full: "满",
    reject: "拒绝",
  };
  const STORAGE_KEY = "preference-bottles:mvp:1";
  const BODY_PATH =
    "M33 23 L67 23 L67 35 C67 40 83 43 83 58 L83 126 Q83 139 70 139 L30 139 Q17 139 17 126 L17 58 C17 43 33 40 33 35 Z";
  const OPEN_BODY_PATH = BODY_PATH.replace("M33 23 L67 23", "M67 23").replace(
    / Z$/,
    " L33 23",
  );
  const OVERFLOW_CLIP_PATH = BODY_PATH + " M33 0 H67 V24 H33 Z";
  const NECK_FILL = "rgba(233,245,245,.8)";
  const NECK_PATH = "M33 23 L33 34 Q50 38 67 34 L67 23 Z";
  const LINE_PATH = "M25 58 L25 112 M25 120 L25 124";
  const CROSS_PATH = "M36 73 L64 105 M64 73 L36 105";
  // Irregular piles: each level has a different surface rather than four-star rows.
  const FULL_STAR_PILE = [
    [31, 129, 12.2, -17],
    [55, 130, 12.8, 27],
    [74, 120, 11.4, -10],
    [27, 109, 12.3, 35],
    [62, 104, 13.1, 8],
    [39, 87, 13.1, 18],
    [73, 82, 12.5, 29],
    [23, 70, 10.8, -22],
    [66, 62, 12.5, -4],
    [42, 63, 12.8, 32],
    [39, 45, 11.4, -14],
    [60, 36, 11.2, 16],
    [42, 22, 9.8, -5],
    [59, 22, 9.4, 8],
  ];
  const STAR_PILES = {
    empty: [],
    reject: [],
    low: [
      [28, 129, 11.9, -19],
      [50, 130, 12.1, 25],
      [72, 128, 11.8, -8],
      [43, 112, 12.5, 32],
    ],
    medium: [
      [29, 129, 12.1, -17],
      [52, 130, 12.5, 27],
      [73, 123, 11.7, -10],
      [23, 109, 11.4, 35],
      [45, 109, 12.8, -31],
      [66, 104, 12.3, 8],
      [34, 91, 12, 18],
    ],
    high: FULL_STAR_PILE.slice(0, 10),
    full: FULL_STAR_PILE,
  };
  function starsFor(state, seed) {
    let hash = 2166136261;
    for (const char of String(seed)) {
      hash = Math.imul(hash ^ char.codePointAt(0), 16777619) >>> 0;
    }
    function random() {
      hash = (Math.imul(hash, 1664525) + 1013904223) >>> 0;
      return hash / 4294967296;
    }
    return STAR_PILES[state].map(([x, y, r, angle], index) => ({
      x: x + (random() - 0.5) * 2,
      y: y + (random() - 0.5) * 2,
      r: r * (0.95 + random() * 0.08),
      angle: angle + (random() - 0.5) * 36,
      shade: (index + Math.floor(random() * 4)) % 4,
    }));
  }
  const STAR_COLORS = ["#e4bd61", "#eed08b", "#d8ab4f", "#ebcb7d"];
  // Shared full-state spray decorations, kept inside the existing SVG bounds.
  const BURST_STARS = [
    { x: 17, y: 18, r: 11.3, angle: -22, shade: 0 },
    { x: 39, y: 11, r: 10.5, angle: 15, shade: 1 },
    { x: 65, y: 12, r: 11.2, angle: 28, shade: 0 },
    { x: 83, y: 29, r: 11.4, angle: -12, shade: 2 },
  ];
  const BURST_DOTS = [
    [6, 6, 1.2],
    [28, 37, 1],
    [84, 4, 1],
    [96, 16, 1.4],
    [87, 46, 1.1],
  ];
  const BURST_LINES = [
    [8, 32, 4, 28],
    [49, 8, 50, 3],
    [80, 12, 85, 7],
    [94, 36, 98, 39],
  ];
  function burstSVG(radiusScale = 1) {
    return (
      '<g class="star-burst">' +
      BURST_STARS.map(
        (s) =>
          '<polygon points="' +
          starPoints({ ...s, r: s.r * radiusScale }) +
          '" fill="' +
          STAR_COLORS[s.shade] +
          '" stroke="#b18c40" stroke-width=".45" stroke-linejoin="round"/>',
      ).join("") +
      BURST_DOTS.map(
        ([x, y, r]) =>
          '<circle cx="' +
          x +
          '" cy="' +
          y +
          '" r="' +
          r +
          '" fill="#dbb86e"/>',
      ).join("") +
      BURST_LINES.map(
        ([x1, y1, x2, y2]) =>
          '<path d="M' +
          x1 +
          " " +
          y1 +
          "L" +
          x2 +
          " " +
          y2 +
          '" fill="none" stroke="#dbb86e" stroke-width="1.2" stroke-linecap="round"/>',
      ).join("") +
      "</g>"
    );
  }
  function drawBurst(ctx, radiusScale = 1) {
    BURST_STARS.forEach((s) => {
      const points = starPoints({ ...s, r: s.r * radiusScale })
        .split(" ")
        .map((p) => p.split(",").map(Number));
      ctx.beginPath();
      points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.lineJoin = "round";
      ctx.fillStyle = STAR_COLORS[s.shade];
      ctx.strokeStyle = "#b18c40";
      ctx.lineWidth = 0.45;
      ctx.fill();
      ctx.stroke();
    });
    ctx.fillStyle = "#dbb86e";
    BURST_DOTS.forEach(([x, y, r]) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.strokeStyle = "#dbb86e";
    ctx.lineWidth = 1.2;
    ctx.lineCap = "round";
    BURST_LINES.forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });
  }

  const $ = (id) => document.getElementById(id);
  const segmenter =
    typeof Intl.Segmenter === "function"
      ? new Intl.Segmenter("zh", { granularity: "grapheme" })
      : null;
  function characters(text) {
    return segmenter
      ? Array.from(segmenter.segment(text), (x) => x.segment)
      : Array.from(text);
  }
  function newData() {
    return { version: 2, degreeRange: null, states: {}, customBottles: [] };
  }
  function validState(value) {
    return STATES.includes(value);
  }
  const knownIds = new Set(CATALOG.flatMap((c) => c.items.map((i) => i.id)));
  const degreeIds = new Set(CATALOG[0].items.map((i) => i.id));
  function validateData(data) {
    if (
      !data ||
      data.version !== 2 ||
      !data.states ||
      typeof data.states !== "object" ||
      Array.isArray(data.states) ||
      !Array.isArray(data.customBottles) ||
      data.customBottles.length > 30
    )
      throw new Error("Invalid data");
    const clean = newData();
    if (data.version === 2 && data.degreeRange !== null) {
      const range = data.degreeRange;
      if (
        !Array.isArray(range) ||
        range.length !== 2 ||
        !range.every(Number.isInteger) ||
        range[0] < 0 ||
        range[1] > 4 ||
        range[0] > range[1]
      )
        throw new Error("Invalid degree range");
      clean.degreeRange = range.slice();
    }
    for (const [id, state] of Object.entries(data.states)) {
      if (!knownIds.has(id) || degreeIds.has(id) || !validState(state))
        throw new Error("Invalid state");
      clean.states[id] = state;
    }
    const ids = new Set(knownIds),
      names = new Map(
        CATALOG.map((c) => [c.id, new Set(c.items.map((i) => i.name))]),
      );
    for (const item of data.customBottles) {
      const categoryId = item?.categoryId;
      if (
        !item ||
        typeof item.id !== "string" ||
        item.id.length > 100 ||
        ids.has(item.id) ||
        !names.has(categoryId) ||
        typeof item.name !== "string" ||
        !item.name.trim() ||
        item.name !== item.name.trim() ||
        characters(item.name).length > 12 ||
        !validState(item.state)
      )
        throw new Error("Invalid custom bottle");
      ids.add(item.id);
      names.get(categoryId).add(item.name);
      clean.customBottles.push({
        id: item.id,
        categoryId,
        name: item.name,
        state: item.state,
      });
    }
    return clean;
  }
  let data = newData(),
    storageAvailable = true,
    restoreFailed = false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      try {
        data = validateData(JSON.parse(raw));
      } catch {
        restoreFailed = true;
      }
    }
    const probe = STORAGE_KEY + ":probe";
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
  } catch {
    storageAvailable = false;
  }
  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      storageAvailable = true;
      restoreFailed = false;
    } catch {
      storageAvailable = false;
    }
    scheduleImagePreparation();
  }
  let toastTimer;
  function toast(message) {
    $("toast").textContent = message;
    $("toast").hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => ($("toast").hidden = true), 3200);
  }
  function starPoints(star) {
    let points = [];
    for (let k = 0; k < 10; k++) {
      const angle = ((k * 36 - 90 + star.angle) * Math.PI) / 180,
        r = k % 2 === 0 ? star.r : star.r * 0.46;
      points.push(
        [
          (star.x + Math.cos(angle) * r).toFixed(2),
          (star.y + Math.sin(angle) * r).toFixed(2),
        ].join(","),
      );
    }
    return points.join(" ");
  }
  function starRadiusScale() {
    return matchMedia("(max-width: 599px)").matches ? 0.9 : 1;
  }
  function bottleSVG(state, key, seed = key) {
    const clip = "bottle-clip-" + key,
      full = state === "full",
      radiusScale = starRadiusScale();
    const stars = starsFor(state, seed)
      .map(
        (s) =>
          '<polygon points="' +
          starPoints({ ...s, r: s.r * radiusScale }) +
          '" fill="' +
          STAR_COLORS[s.shade] +
          '" stroke="#b18c40" stroke-width=".45" stroke-linejoin="round"/>',
      )
      .join("");
    const cap = full
      ? ""
      : '<rect x="30" y="16" width="40" height="10" rx="4" fill="#c9f6f5" stroke="#8dbdbd" stroke-width="1.3"/><path d="M36 19h28" stroke="#ffffff" stroke-width="1.4" stroke-linecap="round"/>';
    return (
      '<svg class="bottle-picture" viewBox="0 0 100 150" preserveAspectRatio="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="' +
      clip +
      '"><path d="' +
      (full ? OVERFLOW_CLIP_PATH : BODY_PATH) +
      '"/></clipPath></defs><ellipse cx="50" cy="144" rx="29" ry="3" fill="#cadfde" opacity=".32"/><path d="' +
      (full ? OPEN_BODY_PATH : BODY_PATH) +
      '" fill="#f5fbfb" fill-opacity=".72" stroke="#8dbdbd" stroke-width="1.7"/>' +
      '<g clip-path="url(#' +
      clip +
      ')">' +
      stars +
      "</g>" +
      '<path d="' +
      NECK_PATH +
      '" fill="' +
      NECK_FILL +
      '" stroke="#8dbdbd" stroke-width="1.4"/>' +
      '<path d="' +
      LINE_PATH +
      '" stroke="white" stroke-width="3" stroke-linecap="round" opacity=".9"/>' +
      cap +
      (full ? burstSVG(radiusScale) : "") +
      (state === "reject"
        ? '<path d="' +
          CROSS_PATH +
          '" stroke="#e05265" stroke-width="4" stroke-linecap="round"/>'
        : "") +
      "</svg>"
    );
  }
  function stateFor(item) {
    return item.custom ? item.state : data.states[item.id] || "empty";
  }
  function categoryItems(category) {
    return category.items
      .map((i) => ({ ...i, custom: false }))
      .concat(
        data.customBottles
          .filter((i) => i.categoryId === category.id)
          .map((i) => ({ ...i, custom: true })),
      );
  }
  function findItem(id) {
    for (const category of CATALOG) {
      const item = categoryItems(category).find((i) => i.id === id);
      if (item) return item;
    }
    return null;
  }
  function setName(element, name) {
    const parts = name.match(/^(.*?)(（.*）)$/u);
    if (parts) {
      const first = document.createElement("span");
      first.textContent = parts[1];
      const second = document.createElement("span");
      second.className = "bottle-qualifier";
      second.textContent = parts[2];
      element.append(first, second);
    } else element.textContent = name;
  }
  let svgSequence = 0;
  function refreshCard(card, item) {
    const state = stateFor(item);
    card.dataset.state = state;
    const button = card.querySelector(".bottle-hit");
    button.setAttribute(
      "aria-label",
      item.name +
        "，" +
        STATE_NAMES[state] +
        "，点击切换到" +
        STATE_NAMES[STATES[(STATES.indexOf(state) + 1) % 6]],
    );
    button.querySelector(".art").innerHTML = bottleSVG(
      state,
      String(++svgSequence),
      item.id,
    );
  }
  function createCard(item) {
    const card = document.createElement("div");
    card.className = "bottle-card";
    card.dataset.itemId = item.id;
    const button = document.createElement("button");
    button.className = "bottle-hit";
    button.type = "button";
    button.dataset.action = "cycle";
    const art = document.createElement("span");
    art.className = "art";
    const name = document.createElement("span");
    name.className = "bottle-name";
    setName(name, item.name);
    button.append(art, name);
    card.append(button);
    if (item.custom) {
      const marker = document.createElement("span");
      marker.className = "custom-mark";
      marker.textContent = "自定义";
      marker.setAttribute("aria-hidden", "true");
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "delete-bottle";
      remove.textContent = "×";
      remove.dataset.action = "delete";
      remove.setAttribute("aria-label", "删除瓶子：" + item.name);
      card.append(marker, remove);
    }
    refreshCard(card, item);
    return card;
  }
  function degreeText(range) {
    if (!range) return "尚未选择程度范围";
    const labels = CATALOG[0].items.map((i) => i.name);
    return range[0] === range[1]
      ? labels[range[0]]
      : labels[range[0]] + " — " + labels[range[1]];
  }
  function createDegreeControl() {
    const container = document.createElement("div");
    container.className = "degree-widget";
    container.innerHTML =
      '<div class="degree-summary"><output id="degreeValue" class="degree-value" aria-live="polite"></output></div><div class="degree-control" id="degreeTrack"><div class="degree-rail"></div><div class="degree-fill" id="degreeFill"></div><div class="degree-scale" id="degreeLabels"></div><button type="button" class="degree-thumb" id="degreeLow" role="slider" aria-label="最低程度" aria-valuemin="0" aria-valuemax="4" aria-orientation="horizontal"></button><button type="button" class="degree-thumb" id="degreeHigh" role="slider" aria-label="最高程度" aria-valuemin="0" aria-valuemax="4" aria-orientation="horizontal"></button></div>';
    const labels = container.querySelector("#degreeLabels");
    CATALOG[0].items.forEach((item, index) => {
      const stop = document.createElement("div");
      stop.className = "degree-stop";
      stop.style.left = index * 25 + "%";
      const node = document.createElement("span");
      node.className = "degree-node";
      const tick = document.createElement("span");
      tick.className = "degree-tick";
      node.append(tick);
      const label = document.createElement("div");
      label.className = "degree-label";
      setName(label, item.name);
      stop.append(node, label);
      labels.append(stop);
    });
    const track = container.querySelector("#degreeTrack");
    let drag = null,
      changed = false,
      origin = null;
    function apply(endpoint, index) {
      const range = data.degreeRange ? data.degreeRange.slice() : [0, 4];
      index = Math.max(0, Math.min(4, index));
      range[endpoint] =
        endpoint === 0 ? Math.min(index, range[1]) : Math.max(index, range[0]);
      data.degreeRange = range;
      updateDegree();
      changed = true;
    }
    function indexAt(x) {
      const rect = track.querySelector(".degree-rail").getBoundingClientRect();
      return Math.round(
        Math.max(0, Math.min(1, (x - rect.left) / rect.width)) * 4,
      );
    }
    track.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      const index = indexAt(event.clientX),
        range = data.degreeRange || [0, 4],
        thumb = event.target.closest(".degree-thumb");
      drag = thumb
        ? thumb.id === "degreeLow"
          ? 0
          : 1
        : Math.abs(index - range[0]) < Math.abs(index - range[1])
          ? 0
          : 1;
      origin = { x: event.clientX, y: event.clientY, index };
      changed = false;
      track.setPointerCapture(event.pointerId);
      if (thumb) {
        event.preventDefault();
        thumb.focus({ preventScroll: true });
      }
    });
    track.addEventListener("pointermove", (event) => {
      if (drag === null) return;
      const thumb = track.querySelector(
        drag === 0 ? "#degreeLow" : "#degreeHigh",
      );
      if (
        Math.abs(event.clientY - origin.y) > 12 &&
        Math.abs(event.clientY - origin.y) >
          Math.abs(event.clientX - origin.x) &&
        !event.target.closest(".degree-thumb")
      )
        return;
      if (Math.abs(event.clientX - origin.x) > 5) {
        if (data.degreeRange && data.degreeRange[0] === data.degreeRange[1])
          drag = event.clientX < origin.x ? 0 : 1;
        apply(drag, indexAt(event.clientX));
        thumb.focus({ preventScroll: true });
      }
    });
    track.addEventListener("pointerup", (event) => {
      if (drag === null) return;
      const movedY = Math.abs(event.clientY - origin.y) > 12;
      if (!movedY || changed) apply(drag, indexAt(event.clientX));
      if (changed) persist();
      drag = null;
      origin = null;
    });
    track.addEventListener("pointercancel", () => {
      if (changed) persist();
      drag = null;
      origin = null;
    });
    ["degreeLow", "degreeHigh"].forEach((id, endpoint) =>
      container.querySelector("#" + id).addEventListener("keydown", (event) => {
        let index = (data.degreeRange || [0, 4])[endpoint];
        if (event.key === "ArrowRight" || event.key === "ArrowUp") index++;
        else if (event.key === "ArrowLeft" || event.key === "ArrowDown")
          index--;
        else if (event.key === "Home") index = 0;
        else if (event.key === "End") index = 4;
        else return;
        event.preventDefault();
        apply(endpoint, index);
        persist();
      }),
    );
    return container;
  }
  function updateDegree() {
    if (!$("degreeTrack")) return;
    const range = data.degreeRange || [0, 4];
    $("degreeTrack").dataset.selected = String(data.degreeRange !== null);
    $("degreeValue").textContent = data.degreeRange
      ? data.degreeRange
          .map((index) => CATALOG[0].items[index].name.split("（")[0])
          .filter((name, index, all) => index === 0 || name !== all[0])
          .join(" — ")
      : "未选择";
    $("degreeValue").title = degreeText(data.degreeRange);
    $("degreeValue").setAttribute("aria-label", degreeText(data.degreeRange));
    const degreePosition = (index) => index * 25;
    $("degreeFill").style.left = degreePosition(range[0]) + "%";
    $("degreeFill").style.width = (range[1] - range[0]) * 25 + "%";
    ["degreeLow", "degreeHigh"].forEach((id, index) => {
      const thumb = $(id);
      thumb.style.left = degreePosition(range[index]) + "%";
      thumb.setAttribute("aria-valuenow", String(range[index]));
      thumb.setAttribute(
        "aria-valuetext",
        data.degreeRange
          ? CATALOG[0].items[range[index]].name
          : "尚未选择，" + CATALOG[0].items[range[index]].name,
      );
      thumb.style.zIndex =
        range[0] === range[1]
          ? index === 0 && range[0] === 4
            ? "3"
            : index === 1 && range[1] !== 4
              ? "3"
              : "2"
          : "2";
    });
    Array.from($("degreeLabels").querySelectorAll(".degree-label")).forEach(
      (label, index) =>
        label.classList.toggle(
          "active",
          data.degreeRange !== null && index >= range[0] && index <= range[1],
        ),
    );
  }
  function render() {
    const fragment = document.createDocumentFragment();
    CATALOG.forEach((category) => {
      const section = document.createElement("section");
      section.className = "section";
      section.dataset.categoryId = category.id;
      const title = document.createElement("h2");
      title.className = "section-label";
      title.id = "heading-" + category.id;
      for (const char of category.name) {
        const line = document.createElement("span");
        line.textContent = char;
        title.append(line);
      }
      section.setAttribute("aria-labelledby", title.id);
      const body = document.createElement("div");
      body.className = "section-body";
      if (category.id === "degree") {
        body.append(createDegreeControl());
        section.append(title, body);
        fragment.append(section);
        return;
      }
      const items = categoryItems(category);
      const grid = document.createElement("div");
      grid.className = "bottle-grid";
      items.forEach((item) => grid.append(createCard(item)));
      const add = document.createElement("button");
      add.type = "button";
      add.className = "bottle-hit add-bottle";
      add.dataset.action = "add";
      const addArt = bottleSVG("empty", "add-" + category.id).replace(
        "</svg>",
        '<path d="M50 76v26M37 89h26" stroke="#087f7d" stroke-width="2.5" stroke-linecap="round"/></svg>',
      );
      add.innerHTML =
        '<span class="art">' +
        addArt +
        '</span><span class="bottle-name">添加瓶子</span>';
      add.setAttribute("aria-label", "添加瓶子到" + category.name);
      const addCard = document.createElement("div");
      addCard.className = "add-card";
      addCard.append(add);
      grid.append(addCard);
      body.append(grid);
      section.append(title, body);
      fragment.append(section);
    });
    $("categories").replaceChildren(fragment);
    updateDegree();
    alignSectionLabels();
  }
  function alignDegreeWidth(root = document) {
    const widget = root.querySelector(".degree-widget");
    const grid = root.querySelector(".bottle-grid");
    const picture = grid?.querySelector(".bottle-picture");
    if (!widget || !grid || !picture) return;
    const gridRect = grid.getBoundingClientRect();
    const body = grid.parentElement.getBoundingClientRect();
    const columnGap = parseFloat(getComputedStyle(grid).columnGap) || 0;
    const columnWidth = (gridRect.width - columnGap * 5) / 6;
    const pictureWidth = picture.getBoundingClientRect().width;
    const sideInset = Math.max(0, (columnWidth - pictureWidth) / 2);
    const left = gridRect.left - body.left + sideInset;
    const width = gridRect.width - sideInset * 2;
    if (width <= 0) return;
    widget.style.marginLeft = left + "px";
    widget.style.width = width + "px";
    const bounds = widget.parentElement.getBoundingClientRect();
    const stops = widget.querySelectorAll(".degree-label");
    if (stops.length < 2) return;
    const firstLabel = stops[0].getBoundingClientRect();
    const lastLabel = stops[stops.length - 1].getBoundingClientRect();
    const overflowLeft = Math.max(0, Math.ceil(bounds.left - firstLabel.left));
    const overflowRight = Math.max(0, Math.ceil(lastLabel.right - bounds.right));
    if (!overflowLeft && !overflowRight) return;
    widget.style.marginLeft = left + overflowLeft + "px";
    widget.style.width = Math.max(0, width - overflowLeft - overflowRight) + "px";
  }
  function alignSectionLabels(root = document) {
    alignDegreeWidth(root);
    root.querySelectorAll(".section").forEach((section) => {
      const label = section.querySelector(".section-label");
      const target =
        section.querySelector(".bottle-card, .add-card") ||
        section.querySelector(".degree-node");
      if (!label || !target) return;
      const sectionTop = section.getBoundingClientRect().top;
      const row = target.getBoundingClientRect();
      const labelBox = label.getBoundingClientRect();
      const current = parseFloat(getComputedStyle(label).marginTop) || 0;
      const naturalTop = labelBox.top - sectionTop - current;
      const desiredTop =
        row.top - sectionTop + (row.height - labelBox.height) / 2;
      label.style.marginTop = Math.max(0, desiredTop - naturalTop) + "px";
    });
  }
  let pendingCategory = null,
    confirmation = null,
    modalReturnFocus = null;
  function showDialog(dialog) {
    modalReturnFocus = document.activeElement;
    dialog.showModal();
  }
  function restoreFocus() {
    if (modalReturnFocus?.isConnected)
      modalReturnFocus.focus({ preventScroll: true });
  }
  function askConfirm(title, text, action) {
    confirmation = action;
    $("confirmHeading").textContent = title;
    $("confirmText").textContent = text;
    $("acceptConfirm").textContent =
      title === "清空填写" ? "清空" : title === "删除瓶子" ? "删除" : "确认";
    showDialog($("confirmDialog"));
    $("cancelConfirm").focus();
  }
  $("cancelConfirm").addEventListener("click", () =>
    $("confirmDialog").close(),
  );
  $("confirmDialog").addEventListener("close", () => {
    confirmation = null;
    restoreFocus();
  });
  $("acceptConfirm").addEventListener("click", () => {
    const action = confirmation;
    $("confirmDialog").close();
    if (action) action();
  });
  let pointerOrigin = null;
  $("categories").addEventListener(
    "pointerdown",
    (event) => {
      pointerOrigin = { x: event.clientX, y: event.clientY, moved: false };
    },
    { passive: true },
  );
  $("categories").addEventListener(
    "pointermove",
    (event) => {
      if (
        pointerOrigin &&
        Math.hypot(
          event.clientX - pointerOrigin.x,
          event.clientY - pointerOrigin.y,
        ) > 10
      )
        pointerOrigin.moved = true;
    },
    { passive: true },
  );
  $("categories").addEventListener(
    "pointercancel",
    () => {
      if (pointerOrigin) pointerOrigin.moved = true;
    },
    { passive: true },
  );
  $("categories").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    if (event.detail !== 0 && pointerOrigin?.moved) {
      pointerOrigin = null;
      return;
    }
    pointerOrigin = null;
    const category = CATALOG.find(
        (c) => c.id === button.closest(".section").dataset.categoryId,
      ),
      action = button.dataset.action;
    if (action === "add") {
      if (data.customBottles.length >= 30) {
        toast("最多添加 30 个自定义瓶子");
        return;
      }
      pendingCategory = category;
      $("addHeading").textContent = "添加到" + category.name;
      $("bottleInput").value = "";
      $("nameError").textContent = "";
      $("bottleInput").removeAttribute("aria-invalid");
      $("nameCount").textContent = "0 / 12";
      showDialog($("addDialog"));
      return;
    }
    const card = button.closest(".bottle-card"),
      item = findItem(card.dataset.itemId);
    if (!item) return;
    if (action === "delete") {
      askConfirm("删除瓶子", "确定删除“" + item.name + "”吗？", () => {
        data.customBottles = data.customBottles.filter((i) => i.id !== item.id);
        persist();
        render();
        document
          .querySelector('[data-category-id="' + category.id + '"] .add-bottle')
          .focus({ preventScroll: true });
        toast("瓶子已删除");
      });
      return;
    }
    const next = STATES[(STATES.indexOf(stateFor(item)) + 1) % 6];
    if (item.custom)
      data.customBottles.find((i) => i.id === item.id).state = next;
    else data.states[item.id] = next;
    refreshCard(card, { ...item, state: next });
    persist();
  });
  $("cancelAdd").addEventListener("click", () => $("addDialog").close());
  $("addDialog").addEventListener("close", restoreFocus);
  $("bottleInput").addEventListener("input", () => {
    $("nameCount").textContent =
      characters($("bottleInput").value.trim()).length + " / 12";
    $("nameError").textContent = "";
    $("bottleInput").removeAttribute("aria-invalid");
  });
  let idSequence = 0;
  $("addForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = $("bottleInput").value.trim();
    let error = "";
    if (!name) error = "请输入瓶子名称";
    else if (characters(name).length > 12) error = "名称最多 12 个字符";
    else if (data.customBottles.length >= 30)
      error = "最多添加 30 个自定义瓶子";
    else if (categoryItems(pendingCategory).some((i) => i.name === name))
      error = "此分类已存在同名瓶子";
    if (error) {
      $("nameError").textContent = error;
      $("bottleInput").setAttribute("aria-invalid", "true");
      $("bottleInput").focus();
      return;
    }
    const id =
      "custom-" +
      Date.now().toString(36) +
      "-" +
      ++idSequence +
      "-" +
      Math.random().toString(36).slice(2, 8);
    data.customBottles.push({
      id,
      categoryId: pendingCategory.id,
      name,
      state: "empty",
    });
    persist();
    $("addDialog").close();
    render();
    const card = Array.from(document.querySelectorAll(".bottle-card")).find(
      (el) => el.dataset.itemId === id,
    );
    requestAnimationFrame(() => {
      card.scrollIntoView({
        block: "center",
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
      card.classList.add("flash");
      card.querySelector(".bottle-hit").focus({ preventScroll: true });
    });
  });
  $("resetButton").addEventListener("click", () =>
    askConfirm(
      "清空填写",
      "将所有瓶子恢复为空，并清除程度范围，是否继续？自定义瓶子会保留。",
      () => {
        data.states = {};
        data.degreeRange = null;
        updateDegree();
        data.customBottles.forEach((i) => (i.state = "empty"));
        persist();
        document
          .querySelectorAll(".bottle-card")
          .forEach((card) => refreshCard(card, findItem(card.dataset.itemId)));
        toast("已恢复为空瓶，自定义瓶子已保留");
      },
    ),
  );
  for (const dialog of document.querySelectorAll("dialog")) {
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        dialog.close();
    });
  }
  // The screen and PNG renderer share bottle paths, star positions and colors.
  function fillStroke(ctx, path, fill, stroke, width) {
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.fill(path);
    ctx.stroke(path);
  }
  function drawBottle(ctx, x, y, width, height, state, seed) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(width / 100, height / 150);
    ctx.fillStyle = "#cadfde52";
    ctx.beginPath();
    ctx.ellipse(50, 144, 29, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    const full = state === "full",
      body = new Path2D(full ? OPEN_BODY_PATH : BODY_PATH),
      radiusScale = starRadiusScale();
    fillStroke(ctx, body, "rgba(245,251,251,.72)", "#8dbdbd", 1.7);
    ctx.save();
    ctx.clip(new Path2D(full ? OVERFLOW_CLIP_PATH : BODY_PATH));
    starsFor(state, seed).forEach((s) => {
      const points = starPoints({ ...s, r: s.r * radiusScale })
        .split(" ")
        .map((p) => p.split(",").map(Number));
      ctx.beginPath();
      points.forEach(([px, py], j) =>
        j ? ctx.lineTo(px, py) : ctx.moveTo(px, py),
      );
      ctx.closePath();
      ctx.lineJoin = "round";
      ctx.fillStyle = STAR_COLORS[s.shade];
      ctx.strokeStyle = "#b18c40";
      ctx.lineWidth = 0.45;
      ctx.fill();
      ctx.stroke();
    });
    ctx.restore();
    fillStroke(ctx, new Path2D(NECK_PATH), NECK_FILL, "#8dbdbd", 1.4);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.globalAlpha = 0.9;
    ctx.stroke(new Path2D(LINE_PATH));
    ctx.globalAlpha = 1;
    if (!full) {
      ctx.beginPath();
      ctx.roundRect(30, 16, 40, 10, 4);
      ctx.fillStyle = "#c9f6f5";
      ctx.fill();
      ctx.strokeStyle = "#8dbdbd";
      ctx.lineWidth = 1.3;
      ctx.stroke();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(36, 19);
      ctx.lineTo(64, 19);
      ctx.stroke();
    }
    if (full) drawBurst(ctx, radiusScale);
    if (state === "reject") {
      ctx.strokeStyle = "#e05265";
      ctx.lineWidth = 4;
      ctx.stroke(new Path2D(CROSS_PATH));
    }
    ctx.restore();
  }
  // Export the current page geometry, not a separately designed grid.
  // Controls are removed from an offscreen snapshot; its CSS and SVGs stay identical.
  function createExportSnapshot() {
    const source = document.querySelector(".shell"),
      snapshot = source.cloneNode(true);
    const width = source.getBoundingClientRect().width;
    snapshot.style.cssText =
      "position:absolute;left:-100000px;top:0;width:" +
      width +
      "px;max-width:none;margin:0;visibility:hidden;pointer-events:none;";
    snapshot.setAttribute("aria-hidden", "true");
    snapshot.inert = true;
    snapshot
      .querySelectorAll(".add-card,.delete-bottle,.custom-mark")
      .forEach((el) => el.remove());
    const rank = { full: 0, high: 1, medium: 2, low: 3, reject: 4, empty: 5 };
    snapshot.querySelectorAll(".bottle-grid").forEach((grid) => {
      const cards = Array.from(grid.querySelectorAll(".bottle-card"));
      cards.sort((a, b) => rank[a.dataset.state] - rank[b.dataset.state]);
      grid.replaceChildren(...cards);
    });
    snapshot.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
    snapshot
      .querySelectorAll(".flash")
      .forEach((el) => el.classList.remove("flash"));
    snapshot.style.paddingBottom = "20px";
    document.body.append(snapshot);
    alignSectionLabels(snapshot);
    return snapshot;
  }
  function makeExportCanvas(snapshot) {
    const root = snapshot.getBoundingClientRect(),
      width = root.width,
      height = Math.ceil(root.height);
    // Scale the whole page uniformly, preserving bottle size relative to every other element.
    const scale = Math.min(3, 1200 / width, 8192 / height);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scale, scale);
    const box = (el) => {
      const r = el.getBoundingClientRect();
      return {
        x: r.left - root.left,
        y: r.top - root.top,
        width: r.width,
        height: r.height,
      };
    };
    const number = (value) => parseFloat(value) || 0;
    const visibleColor = (color) =>
      color !== "transparent" && color !== "rgba(0, 0, 0, 0)";
    function paintBox(el) {
      const r = box(el),
        style = getComputedStyle(el);
      if (style.display === "none" || !r.width || !r.height) return;
      const radius = number(style.borderTopLeftRadius);
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(r.x, r.y, r.width, r.height, radius);
      if (visibleColor(style.backgroundColor)) {
        ctx.fillStyle = style.backgroundColor;
        ctx.fill();
      }
      const border = number(style.borderTopWidth);
      if (border && visibleColor(style.borderTopColor)) {
        ctx.beginPath();
        ctx.roundRect(
          r.x + border / 2,
          r.y + border / 2,
          r.width - border,
          r.height - border,
          Math.max(0, radius - border / 2),
        );
        ctx.strokeStyle = style.borderTopColor;
        ctx.lineWidth = border;
        ctx.stroke();
      }
      ctx.restore();
    }
    snapshot.querySelectorAll(".section,.bottle-card").forEach(paintBox);
    snapshot.querySelectorAll(".bottle-card").forEach((card) => {
      const r = box(card.querySelector(".bottle-picture"));
      drawBottle(
        ctx,
        r.x,
        r.y,
        r.width,
        r.height,
        card.dataset.state,
        card.dataset.itemId,
      );
    });
    snapshot
      .querySelectorAll(".degree-rail,.degree-fill,.degree-tick")
      .forEach(paintBox);
    snapshot.querySelectorAll(".degree-thumb").forEach((thumb) => {
      const r = box(thumb),
        style = getComputedStyle(thumb),
        dot = getComputedStyle(thumb, "::after");
      const x = r.x + number(style.paddingLeft),
        y = r.y + number(style.paddingTop),
        w = number(dot.width),
        h = number(dot.height);
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(
        x + w / 2,
        y + h / 2,
        (w - number(dot.borderTopWidth)) / 2,
        (h - number(dot.borderTopWidth)) / 2,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = dot.backgroundColor;
      ctx.fill();
      ctx.lineWidth = number(dot.borderTopWidth);
      ctx.strokeStyle = dot.borderTopColor;
      ctx.stroke();
      ctx.restore();
    });
    // DOM Range supplies the browser's actual wrapping, spacing and per-glyph positions.
    const walker = document.createTreeWalker(snapshot, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (!node.textContent.trim() || node.parentElement.closest("svg"))
        continue;
      const style = getComputedStyle(node.parentElement);
      if (style.display === "none") continue;
      ctx.font =
        style.fontStyle +
        " " +
        style.fontWeight +
        " " +
        style.fontSize +
        " " +
        style.fontFamily;
      ctx.fillStyle = style.color;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      const range = document.createRange();
      let offset = 0;
      for (const char of characters(node.textContent)) {
        range.setStart(node, offset);
        offset += char.length;
        range.setEnd(node, offset);
        if (!char.trim()) continue;
        const r = range.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        const metrics = ctx.measureText(char),
          descent =
            metrics.fontBoundingBoxDescent ?? number(style.fontSize) * 0.2;
        ctx.fillText(char, r.left - root.left, r.bottom - root.top - descent);
      }
    }
    return canvas;
  }
  const imageSaveDialog = $("imageSaveDialog");
  let saveImageUrl = null;
  let preparedImage = null,
    imageJob = null,
    preparationTimer;
  function appleMobile() {
    return (
      /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );
  }
  function mobileSaveFlow() {
    return (
      appleMobile() ||
      /Android/i.test(navigator.userAgent) ||
      matchMedia("(pointer:coarse)").matches
    );
  }
  function supportsImageShare(file) {
    try {
      return (
        window.isSecureContext &&
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      );
    } catch {
      return false;
    }
  }
  function downloadImage(blob) {
    const url = URL.createObjectURL(blob),
      anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "喜好小瓶子.png";
    document.body.append(anchor);
    try {
      anchor.click();
    } finally {
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    }
  }
  function clearSaveImage() {
    const url = saveImageUrl;
    saveImageUrl = null;
    $("saveImage").removeAttribute("src");
    if (url) setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  function openLongPressSave(file) {
    clearSaveImage();
    saveImageUrl = URL.createObjectURL(file);
    $("saveImage").src = saveImageUrl;
    $("imageSaveHint").textContent = appleMobile()
      ? "长按图片，选择“存储图像”或“保存图像”保存到照片。"
      : "长按图片，选择保存图片。";
    imageSaveDialog.showModal();
  }
  $("closeImageSave").addEventListener("click", () => imageSaveDialog.close());
  imageSaveDialog.addEventListener("close", clearSaveImage);
  function imageKey() {
    return (
      JSON.stringify(data) +
      ":" +
      document.querySelector(".shell").getBoundingClientRect().width
    );
  }
  async function generateImageFile() {
    // Capture immediately so changes during generation do not alter this image.
    let snapshot = createExportSnapshot(),
      canvas;
    try {
      await document.fonts.ready;
      canvas = makeExportCanvas(snapshot);
      snapshot.remove();
      snapshot = null;
      const blob = await new Promise((resolve, reject) =>
        canvas.toBlob(
          (value) =>
            value ? resolve(value) : reject(new Error("PNG generation failed")),
          "image/png",
        ),
      );
      return new File([blob], "喜好小瓶子.png", { type: "image/png" });
    } finally {
      if (snapshot) snapshot.remove();
      if (canvas) {
        canvas.width = 1;
        canvas.height = 1;
      }
    }
  }
  function prepareImage(key = imageKey()) {
    if (preparedImage?.key === key) return Promise.resolve(preparedImage.file);
    if (imageJob?.key === key) return imageJob.promise;
    const job = { key };
    job.promise = generateImageFile()
      .then((file) => {
        if (imageKey() === key) preparedImage = { key, file };
        return file;
      })
      .finally(() => {
        if (imageJob === job) imageJob = null;
      });
    imageJob = job;
    return job.promise;
  }
  function scheduleImagePreparation() {
    clearTimeout(preparationTimer);
    if (!mobileSaveFlow()) return;
    // Prepare once editing pauses, so the save click can open the system menu directly.
    preparationTimer = setTimeout(() => {
      prepareImage().catch(() => {});
    }, 700);
  }
  const mobileBottles = matchMedia("(max-width: 599px)");
  document.body.dataset.compactStars = mobileBottles.matches ? "1" : "0";
  window.addEventListener("resize", () => {
    const compact = mobileBottles.matches ? "1" : "0";
    if (document.body.dataset.compactStars !== compact) {
      document.body.dataset.compactStars = compact;
      document.querySelectorAll(".bottle-card").forEach((card) => {
        const item = findItem(card.dataset.itemId);
        if (item) refreshCard(card, item);
      });
    }
    alignSectionLabels();
    scheduleImagePreparation();
  });
  async function saveMobileImage(file) {
    if (!supportsImageShare(file)) {
      openLongPressSave(file);
      return;
    }
    if (navigator.userActivation && !navigator.userActivation.isActive) {
      toast("图片已准备好，请再点一次“保存图片”");
      return;
    }
    try {
      // Cached files reach this call without awaiting any work after the click.
      await navigator.share({ files: [file] });
    } catch (error) {
      if (error.name !== "AbortError") openLongPressSave(file);
    }
  }
  let exporting = false;
  $("exportButton").addEventListener("click", async () => {
    if (exporting) return;
    exporting = true;
    clearTimeout(preparationTimer);
    const button = $("exportButton"),
      label = button.innerHTML,
      mobile = mobileSaveFlow();
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    try {
      const key = imageKey();
      if (mobile && preparedImage?.key === key) {
        await saveMobileImage(preparedImage.file);
      } else {
        button.textContent = "正在生成…";
        const file = mobile
          ? await prepareImage(key)
          : await generateImageFile();
        if (mobile) await saveMobileImage(file);
        else {
          downloadImage(file);
          toast("下载已发起");
        }
      }
    } catch {
      toast("图片生成失败，请重试");
    } finally {
      exporting = false;
      button.disabled = false;
      button.removeAttribute("aria-busy");
      button.innerHTML = label;
    }
  });
  render();
  scheduleImagePreparation();
})();
