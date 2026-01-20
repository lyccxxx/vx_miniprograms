const DISH_INGREDIENT_MAP = {
  番茄鸡蛋面: ["番茄", "鸡蛋", "小麦面"],
  宫保鸡丁: ["鸡肉", "花生", "黄瓜", "干辣椒"],
  麻婆豆腐: ["豆腐", "牛肉末", "花椒", "豆瓣酱"],
  牛肉拉面: ["牛肉", "小麦面", "青菜"],
  皮蛋瘦肉粥: ["大米", "皮蛋", "瘦肉"]
}

const KEYWORD_INGREDIENTS = {
  鸡蛋: ["鸡蛋"],
  番茄: ["番茄"],
  豆腐: ["豆腐"],
  牛肉: ["牛肉"],
  鸡肉: ["鸡肉"],
  虾: ["虾"],
  鱼: ["鱼"],
  菠菜: ["菠菜"],
  西兰花: ["西兰花"],
  胡萝卜: ["胡萝卜"],
  玉米: ["玉米"],
  南瓜: ["南瓜"],
  红薯: ["红薯"],
  大米: ["大米"],
  小麦: ["小麦面"],
  土豆: ["土豆"],
  香菇: ["香菇"],
  口蘑: ["口蘑"],
  黄瓜: ["黄瓜"]
}

Page({
  data: {
    ingredients: ["菠菜", "番茄", "鸡蛋"],
    uniqueIngredients: ["菠菜", "番茄", "鸡蛋"],
    rollingText: "菠菜 · 番茄 · 鸡蛋",
    dishInput: "",
    takeawayInput: "",
    lastAnalyzed: [],
    mealRecommendations: []
  },
  onLoad() {
    this.updateRollingText()
    this.startRollingTicker()
    this.updateMealRecommendations()
  },
  onUnload() {
    if (this.ticker) {
      clearInterval(this.ticker)
    }
  },
  onDishInput(event) {
    this.setData({ dishInput: event.detail.value })
  },
  onTakeawayInput(event) {
    this.setData({ takeawayInput: event.detail.value })
  },
  analyzeDish() {
    const dishName = this.data.dishInput.trim()
    if (!dishName) {
      wx.showToast({ title: "请输入菜名", icon: "none" })
      return
    }

    const fromMap = DISH_INGREDIENT_MAP[dishName] || []
    const fromKeywords = Object.keys(KEYWORD_INGREDIENTS)
      .filter((keyword) => dishName.includes(keyword))
      .flatMap((keyword) => KEYWORD_INGREDIENTS[keyword])

    const analyzed = Array.from(new Set([...fromMap, ...fromKeywords]))
    const newIngredients = Array.from(new Set([...this.data.ingredients, ...analyzed]))

    this.setData({
      ingredients: newIngredients,
      uniqueIngredients: newIngredients,
      lastAnalyzed: analyzed,
      dishInput: ""
    })
    this.updateRollingText()
  },
  recordTakeaway() {
    const content = this.data.takeawayInput.trim()
    if (!content) {
      wx.showToast({ title: "请输入外卖记录", icon: "none" })
      return
    }
    const dishNames = content
      .split(/[，,、\n]/)
      .map((item) => item.trim())
      .filter(Boolean)

    let collected = []
    dishNames.forEach((name) => {
      const mapped = DISH_INGREDIENT_MAP[name] || []
      const keywordMatched = Object.keys(KEYWORD_INGREDIENTS)
        .filter((keyword) => name.includes(keyword))
        .flatMap((keyword) => KEYWORD_INGREDIENTS[keyword])
      collected = collected.concat(mapped, keywordMatched)
    })

    const merged = Array.from(new Set([...this.data.ingredients, ...collected]))
    this.setData({
      ingredients: merged,
      uniqueIngredients: merged,
      takeawayInput: ""
    })
    this.updateRollingText()
    wx.showToast({ title: "已自动录入", icon: "success" })
  },
  openCoupon() {
    wx.showModal({
      title: "跳转外卖",
      content: "此处可接入外卖平台领券跳转。",
      confirmText: "知道了",
      showCancel: false
    })
  },
  updateRollingText() {
    const unique = this.data.uniqueIngredients
    const display = unique.slice(-10).join(" · ")
    this.setData({ rollingText: display || "暂无记录" })
  },
  startRollingTicker() {
    this.ticker = setInterval(() => {
      const ingredients = [...this.data.uniqueIngredients]
      if (ingredients.length === 0) {
        this.setData({ rollingText: "暂无记录" })
        return
      }
      const next = ingredients.shift()
      ingredients.push(next)
      this.setData({ rollingText: ingredients.slice(0, 8).join(" · ") })
    }, 3500)
  },
  updateMealRecommendations() {
    const hour = new Date().getHours()
    const menus = [
      { meal: "早餐", menu: "燕麦牛奶 + 水煮蛋 + 苹果" },
      { meal: "午餐", menu: "杂粮饭 + 清炒西兰花 + 番茄鸡胸" },
      { meal: "晚餐", menu: "南瓜粥 + 清蒸鱼 + 凉拌黄瓜" }
    ]
    let filtered = menus
    if (hour >= 14 && hour < 18) {
      filtered = menus.filter((item) => item.meal === "晚餐")
    } else if (hour >= 11 && hour < 14) {
      filtered = menus.filter((item) => item.meal !== "早餐")
    } else if (hour >= 18) {
      filtered = menus.filter((item) => item.meal === "晚餐")
    }
    this.setData({ mealRecommendations: filtered })
  }
})
