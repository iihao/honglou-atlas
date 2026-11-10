# -*- coding: utf-8 -*-
"""《红楼梦图谱》隐语与府邸数据。

三块内容，都只写“可核对”的部分：

1. WORDPLAY —— 谐音、拆字、反语。红学里最没争议的一类，作者在开卷就写明
   “将真事隐去”“用假语村言”。个别（如“冷子兴”“贾政”）属后人推断，标“一说”。
2. FORESHADOW —— 谶语与结局对照。判词（第5回）多是预叙，前八十回里应验的很少，
   多数由程高本续书收尾，另有一批学界至今无定论。每条给出「出处 / 所谶 / 结局 /
   判定」，判定只有三种：印证（前八十回内已应验）、续书（程高本收束）、存疑。
3. MAP —— 宁国府、荣国府、大观园示意平面。只采用书中有明文依据的相对关系
   （街东宁府、街西荣府；大观园在荣府东北、借宁府会芳园；第17回游园先后次序），
   不做比例复原。各条目 basis 字段写明依据。
"""

# ------------------------------------------------------------------ 谐音

WORDPLAY = [
    # ---- 开卷：作者自述的两组 ----
    dict(id="wp-zhenshiyin", word="甄士隐", sound="真事隐", kind="谐音",
         meaning="“将真事隐去”，作者自述删去真事、只留故事",
         person="pl-zhenshiyin", chapter="第1回", verdict="通行",
         note="开卷“作者自云：曾历过一番梦幻之后，故将真事隐去”，随即以“甄士隐”为人物名。"),
    dict(id="wp-jiayucun", word="贾雨村", sound="假语村言", kind="谐音",
         meaning="“用假语村言敷演故事”；名“化”谐“假话”，字“时飞”谐“实非”",
         person="pl-jiayucun", chapter="第1回", verdict="通行",
         note="第1回“虽我未学，下笔无文，又何妨用假语村言敷演出一段故事来”；"
              "人物姓贾名化、字时飞、别号雨村，三层皆是谐音。"),
    dict(id="wp-yinglian", word="甄英莲", sound="真应怜", kind="谐音",
         meaning="真该怜惜；后改名香菱，一生命途多舛",
         person="pl-xiangling", chapter="第1回", verdict="通行",
         note="甄士隐独女，元宵被拐，后为薛蟠妾，改名香菱。判词“平生遭际实堪伤”与之呼应。"),
    dict(id="wp-jiaoxing", word="娇杏", sound="侥幸", kind="谐音",
         meaning="偶然回头一看，便由丫鬟成了知府夫人",
         person="pl-jiaoxing", chapter="第2回", verdict="通行",
         note="第2回“偶因一着错，便为人上人”——她的运气正是对“侥幸”的注脚。"),
    dict(id="wp-huoqi", word="霍启", sound="祸起", kind="谐音",
         meaning="祸事由此而起：他丢了英莲，甄家从此败落",
         person="pl-huoqi", chapter="第1回", verdict="通行",
         note="甄家仆人，元宵抱英莲看灯时因小解将她放在门槛上，遂被拐走。"),
    dict(id="wp-fengsu", word="封肃", sound="风俗", kind="谐音",
         meaning="世态炎凉即“风俗”；他对落难女婿的态度就是人间常态",
         person="pl-fengsu", chapter="第1回", verdict="通行",
         note="甄士隐的岳父，见女婿落魄便冷眼相待，最后连田产也要盘算。"),
    dict(id="wp-fengyuan", word="冯渊", sound="逢冤", kind="谐音",
         meaning="遇上冤家：为买英莲被薛蟠打死，白白送了命",
         person="pl-fengyuan", chapter="第4回", verdict="通行",
         note="“逢冤”点出第4回“葫芦僧乱判葫芦案”的冤情。"),

    # ---- 四春 ----
    dict(id="wp-yuanchun", word="元春", sound="原", kind="谐音（合读）",
         meaning="元、迎、探、惜四姐妹连读即“原应叹息”",
         person="pl-jiayuanchun", chapter="第2回起", verdict="通行",
         note="四春之名合为“原应叹息”，是全书最著名的一组谐音；各人结局正是“可叹”二字。"),
    dict(id="wp-yingchun", word="迎春", sound="应", kind="谐音（合读）",
         meaning="同上，“应”",
         person="pl-yingchun", chapter="第2回起", verdict="通行",
         note="嫁孙绍祖后受虐，判词“子系中山狼”。"),
    dict(id="wp-tanchun", word="探春", sound="叹", kind="谐音（合读）",
         meaning="同上，“叹”",
         person="pl-tanchun", chapter="第2回起", verdict="通行",
         note="最有才干却远嫁，判词“才自精明志自高”。"),
    dict(id="wp-xichun", word="惜春", sound="息", kind="谐音（合读）",
         meaning="同上，“息”；一说“息”取“止息”义",
         person="pl-xichun", chapter="第2回起", verdict="通行",
         note="四春中最幼，最终出家，“独卧青灯古佛旁”。"),

    # ---- 秦家与清客 ----
    dict(id="wp-qinzhong", word="秦钟", sound="情种", kind="谐音",
         meaning="情之所钟，为情所困而早夭",
         person="pl-qinzhong", chapter="第7回起", verdict="通行",
         note="秦可卿之弟，与宝玉同入家塾，第16回病死。"),
    dict(id="wp-qinye", word="秦业", sound="情孽", kind="谐音",
         meaning="情之孽债；一说“情业”",
         person="pl-qinye", chapter="第8回起", verdict="一说",
         note="秦钟、秦可卿之父，营缮郎。"),
    dict(id="wp-qinkeqing", word="秦可卿", sound="情可轻", kind="谐音",
         meaning="情可以轻忽；一说“情可亲”",
         person="pl-qinkeqing", chapter="第5、13回", verdict="一说",
         note="太虚幻境中名“兼美”，寓钗黛之美兼有；其名多有异说，故标“一说”。"),
    dict(id="wp-shanpinren", word="单聘仁", sound="善骗人", kind="谐音",
         meaning="会骗人的清客",
         person="pl-shanpinren", chapter="第16回前后", verdict="通行",
         note="贾政门下清客，与詹光、卜固修同行，专会凑趣帮闲。"),
    dict(id="wp-buguxiu", word="卜固修", sound="不顾羞", kind="谐音",
         meaning="不顾羞耻",
         person="pl-buguxiu", chapter="第16回前后", verdict="通行",
         note="同上，清客三人组之一。"),
    dict(id="wp-zhanguang", word="詹光", sound="沾光", kind="谐音",
         meaning="沾主家的光",
         person="pl-zhanguang", chapter="第16回前后", verdict="通行",
         note="同上。三人姓名连读即“沾光、善骗人、不顾羞”。"),
    dict(id="wp-bushiren", word="卜世仁", sound="不是人", kind="谐音",
         meaning="不是人：亲外甥来借东西也一口回绝",
         person="pl-bushiren", chapter="第24回", verdict="通行",
         note="贾芸的舅舅，开香料铺，刻薄势利。"),

    # ---- 官场与仆役 ----
    dict(id="wp-daiquan", word="戴权", sound="带权", kind="谐音",
         meaning="带着权来办事：卖官鬻爵，一千二百两一个龙禁尉",
         person="pl-daiquan", chapter="第13回", verdict="通行",
         note="大明宫掌宫内相，为贾蓉捐官，一句“既是咱们的孩子”便把价码定了。"),
    dict(id="wp-zhangyoushi", word="张友士", sound="有事", kind="谐音",
         meaning="有事才来的医生",
         person="pl-zhangyoushi", chapter="第10回", verdict="通行",
         note="为秦可卿诊病的太医，医理一段是全书少见的详细脉案。"),
    dict(id="wp-wangren", word="王仁", sound="忘仁", kind="谐音",
         meaning="忘了仁义：伙同贾环图卖外甥女巧姐",
         person="pl-wangren", chapter="后四十回", verdict="通行",
         note="王熙凤之兄，巧姐的舅舅，正应判词“家亡莫论亲”。"),
    dict(id="wp-wuxindeng", word="吴新登", sound="无星戥", kind="谐音",
         meaning="没有准星的秤：账目全凭他说了算",
         person="", chapter="第8回前后", verdict="通行",
         note="荣国府银库房总领，“无星戥”直指其盘剥克扣。"),
    dict(id="wp-fushi", word="傅试", sound="附势", kind="谐音",
         meaning="趋附权势；其妹傅秋芳的婚事也全为攀附",
         person="", chapter="第35回前后", verdict="一说",
         note="通判，想借妹妹傅秋芳攀结权贵，故为“附势”。"),
    dict(id="wp-shanjie", word="善姐", sound="名善实恶", kind="反语",
         meaning="名叫“善”，却替凤姐折磨尤二姐",
         person="", chapter="第68回", verdict="通行",
         note="此类“反语命名”与谐音同源：名与行相反，讽刺更重。"),
    dict(id="wp-lengzixing", word="冷子兴", sound="冷眼观兴衰", kind="会意",
         meaning="冷眼看贾府之兴；第2回由他“演说荣国府”，替读者理清家世",
         person="pl-lengzixing", chapter="第2回", verdict="一说",
         note="周瑞家的女婿、古董商。以局外人身份交代宁荣两府谱系，是全书的结构性人物。"),
    dict(id="wp-xiren", word="花袭人", sound="花气袭人", kind="取义",
         meaning="取自陆游“花气袭人知骤暖”，宝玉据其姓“花”改名",
         person="pl-xiren", chapter="第3、23回", verdict="通行",
         note="原为贾母之婢珍珠，宝玉因旧诗改名。名字本身即“温柔和顺”的注脚。"),
    dict(id="wp-yuhan", word="蒋玉菡", sound="将玉含", kind="谐音",
         meaning="“将玉含”：与宝玉互赠汗巾，后来娶了袭人",
         person="pl-jiangyuhan", chapter="第28、120回", verdict="一说",
         note="优伶琪官。判词“堪羡优伶有福”即指袭人终归其手。"),

    # ---- 地名与器物 ----
    dict(id="wp-shili", word="十里街 · 仁清巷", sound="势利街 · 人情巷", kind="谐音",
         meaning="势利、人情——葫芦庙所在的街巷名",
         person="", chapter="第1回", verdict="通行",
         note="甄家就在这条街上，故事从“势利”与“人情”之间开场。"),
    dict(id="wp-huzhou", word="胡州", sound="胡诌", kind="谐音",
         meaning="贾雨村的籍贯，暗示其言多虚妄",
         person="pl-jiayucun", chapter="第1回", verdict="通行",
         note="通行本作“湖州”，庚辰本作“胡州”，学界多以“胡诌”为作者本意。"),
    dict(id="wp-wujiya", word="大荒山 · 无稽崖", sound="荒唐 · 无稽", kind="谐音",
         meaning="荒唐无稽：顽石出处即故事来源",
         person="", chapter="第1回", verdict="通行",
         note="“满纸荒唐言”与山名相互印证。"),
    dict(id="wp-qinggeng", word="青埂峰", sound="情根", kind="谐音",
         meaning="情之根：顽石在此，情事由兹而起",
         person="", chapter="第1回", verdict="通行",
         note="“青埂”谐“情根”，与“大荒山”“无稽崖”构成一组。"),
    dict(id="wp-qianhong", word="千红一窟 · 万艳同杯", sound="千红一哭 · 万艳同悲", kind="谐音",
         meaning="太虚幻境中的茶与酒：众女子的共同命运",
         person="", chapter="第5回", verdict="通行",
         note="“窟/杯”谐“哭/悲”，警幻仙姑以此待宝玉，是全书的判词式命名。"),
    dict(id="wp-qunfang", word="群芳髓", sound="群芳碎", kind="谐音",
         meaning="群芳之“碎”：诸女儿终归零落",
         person="", chapter="第5回", verdict="通行",
         note="与“千红一窟”“万艳同杯”并列，同出第5回太虚幻境。"),
    dict(id="wp-jiazheng", word="贾政 · 贾赦 · 贾琏", sound="假正 · 假赦 · 假廉", kind="谐音",
         meaning="以“假”字统摄贾府：假正经、假赦免、假廉",
         person="pl-jiazheng", chapter="第2回起", verdict="一说",
         note="“贾”姓本即“假”，“政/赦/琏”是否各有谐音，属后人推论，故标“一说”。"),
]

# ------------------------------------------------------------- 谶语与结局

# verdict: 印证 = 前八十回内已应验；续书 = 程高本回目收束；存疑 = 诸说不一
FORESHADOW = [
    dict(id="fs-qinkeqing", person="pl-qinkeqing", fate="fate-qinkeqing",
         line="情天情海幻情身，情既相逢必主淫。漫言不肖皆荣出，造衅开端实在宁。",
         omen="点明“情”为祸始，且把败家的开端归于宁国府",
         ending="第13回“秦可卿死封龙禁尉”，天香楼一节（庚辰本“淫丧天香楼”已被删改）",
         verdict="印证", scope="前八十回",
         note="十三回即应验，是正册里唯一在前八十回完成闭环的一则。"
              "脂批“秦可卿淫丧天香楼”与今本病死之间的落差，是红学一大关节。"),
    dict(id="fs-qingwen", person="pl-qingwen", fate="fate-qingwen",
         line="霁月难逢，彩云易散。心比天高，身为下贱。风流灵巧招人怨。寿夭多因诽谤生，多情公子空牵念。",
         omen="“心比天高，身为下贱”写其处境；“诽谤”直指被诬",
         ending="第77回“俏丫鬟抱屈夭风流”，病死；宝玉作《芙蓉女儿诔》",
         verdict="印证", scope="前八十回",
         note="“霁月”拆“晴”、“彩云”拆“雯”，名字已入谶中。"
              "脂批《芙蓉诔》隐含黛玉之死，是探佚的重要线索。"),
    dict(id="fs-daiyu", person="pl-daiyu", fate="fate-baochai-daiyu",
         line="可叹停机德，堪怜咏絮才。玉带林中挂，金簪雪里埋。",
         omen="“玉带林中挂”倒读“林黛玉”，且“挂”非善终之象；“金簪雪里埋”写宝钗的冷落",
         ending="第98回“苦绛珠魂归离恨天”，病中泪尽而逝；以“林黛玉焚稿断痴情”为高潮",
         verdict="续书", scope="程高本第97–98回",
         note="程高本作病亡，与“挂”字不合。探佚多主“泪尽而逝”“沉湖”等说，"
              "脂批“冷月葬花魂”“寒塘渡鹤影”常被引作旁证。学界至今无定论，故另标存疑。",
         doubt=True),
    dict(id="fs-baochai", person="pl-xuebaochai", fate="fate-baochai-daiyu",
         line="可叹停机德……金簪雪里埋。",
         omen="“停机德”许其贤；与黛玉同图合一判，暗示二人命运纠缠",
         ending="第97回与宝玉成婚，宝玉出家后“空闺独守”（第120回）",
         verdict="续书", scope="程高本第97、120回",
         note="“雪”谐“薛”，金簪埋在雪中即终身冷落，续书处理与此可以对应。"),
    dict(id="fs-yuanchun", person="pl-jiayuanchun", fate="fate-yuanchun",
         line="二十年来辨是非，榴花开处照宫闱。三春争及初春景，虎兕相逢大梦归。",
         omen="“初春”即元春，入宫之贵；末句以“虎兕相逢”寓政治倾覆",
         ending="第95回“因讹成实元妃薨逝”，死于宫中",
         verdict="续书", scope="程高本第95回",
         note="“虎兕相逢”程乙本作“虎兔相逢”，一说指元妃属兔、卒于虎年，"
              "一说指两派势力相争。续书作病死，未写“大梦归”的政治意味，"
              "故探佚多认为元春之死与贾府抄家直接相关。"),
    dict(id="fs-tanchun", person="pl-tanchun", fate="fate-tanchun",
         line="才自精明志自高，生于末世运偏消。清明涕送江边望，千里东风一梦遥。",
         omen="远嫁，且“清明”点出离家时节",
         ending="第102回“探春远适”（嫁镇海总制周琼之子），此后归宁",
         verdict="续书", scope="程高本第102回",
         note="前八十回只到议婚（第77回“也难绾系也难羁”风筝谜），"
              "“涕送江边”暗示远嫁泣别；续书写她远嫁后又回家，与判词“一梦遥”的决绝不符，"
              "探佚多主“一去不返”。"),
    dict(id="fs-xiangyun", person="pl-xiangyun", fate="fate-xiangyun",
         line="富贵又何为，襁褓之间父母违。展眼吊斜晖，湘江水逝楚云飞。",
         omen="幼失父母、婚后离散，如“湘江”“楚云”般消散",
         ending="第106–108回，丈夫暴病而亡，湘云守寡",
         verdict="续书", scope="程高本第106–108回",
         note="第31回回目“因麒麟伏白首双星”是另一条线索，"
              "探佚多推测她与宝玉晚年重逢，与续书的“守寡”不同。"),
    dict(id="fs-miaoyu", person="pl-miaoyu", fate="fate-miaoyu",
         line="欲洁何曾洁，云空未必空。可怜金玉质，终陷淖泥中。",
         omen="求出世而不得，“终陷淖泥”四字极重",
         ending="第112回被盗贼劫走，下落不明（“不知去向”）",
         verdict="续书", scope="程高本第112回",
         note="“淖泥”具体所指历来有争议（被劫、被卖、被污），续书只写被劫，"
              "避开了“洁”与“陷”的正面对撞，因此这一条常被判为“处理得太轻”。"),
    dict(id="fs-yingchun", person="pl-yingchun", fate="fate-yingchun",
         line="子系中山狼，得志便猖狂。金闺花柳质，一载赴黄粱。",
         omen="“子系”合为“孙”，直指孙绍祖；“一载”给出时限",
         ending="第109回“还孽债迎女返真元”，被孙绍祖虐待致死，距出嫁约一年",
         verdict="续书", scope="程高本第109回",
         note="前八十回（第79–80回）已写出孙绍祖的凶暴与迎春的忍让，"
              "“一载赴黄粱”在续书里按时限完成，是十五则中对得最工整的一条。"),
    dict(id="fs-xichun", person="pl-xichun", fate="fate-xichun",
         line="勘破三春景不长，缁衣顿改昔年妆。可怜绣户侯门女，独卧青灯古佛旁。",
         omen="“勘破三春”即看透元、迎、探三姐的结局而决意出家",
         ending="第118回“记微嫌舅兄欺弱女　惊谜语妻妾谏痴人”前后剪发出家，后随疯僧而去",
         verdict="续书", scope="程高本第115–118回",
         note="前八十回已有强烈伏笔（第74回“我不了悟，也断不能了”），"
              "出家方向无争议，具体方式（在家修行、云游）诸本不同。"),
    dict(id="fs-xifeng", person="pl-wangxifeng", fate="fate-xifeng",
         line="凡鸟偏从末世来，都知爱慕此生才。一从二令三人木，哭向金陵事更哀。",
         omen="“凡鸟”合为“凤”；“一从二令三人木”历来众解，多以为“人木”即“休”",
         ending="第114回“王熙凤历幻返金陵”，病死；临终托孤巧姐",
         verdict="存疑", scope="程高本第114回",
         note="“二令”或解作“冷”、“三人木”或解作“休”，合为被贾琏休弃后哭回金陵。"
              "续书写她病死，未休弃，故“从、令、休”三阶段的解读者最多，但文本无定论。"
              "脂批“知命强英雄”另有指向。"),
    dict(id="fs-qiaojie", person="pl-qiaojie", fate="fate-qiaojie",
         line="势败休云贵，家亡莫论亲。偶因济刘氏，巧得遇恩人。",
         omen="家败后被亲人出卖，因母亲接济过刘姥姥而得救",
         ending="第119回，刘姥姥设计将巧姐接出，嫁与农家（周姓富户）",
         verdict="续书", scope="程高本第119回",
         note="“巧”字入名（刘姥姥取“巧”），前后呼应最圆满。"
              "也有探佚认为巧姐流落烟花巷（依“择膏粱，谁承望流落在烟花巷”），"
              "续书的团圆处理偏于温和。"),
    dict(id="fs-livan", person="pl-livan", fate="fate-livan",
         line="桃李春风结子完，到头谁似一盆兰。如冰水好空相妒，枉与他人作笑谈。",
         omen="“结子完”一子而终；“一盆兰”指贾兰；末句叹其守节成空谈",
         ending="第119回贾兰中举，李纨受诰封，旋即病故（“母以子贵”而不得久享）",
         verdict="续书", scope="程高本第119–120回",
         note="“枉与他人作笑谈”一句解者不一：一说指守节毫无意义，一说指旁人议论；"
              "续书按“母以子贵”收束，恰与“作笑谈”形成反讽。"),
    dict(id="fs-xiangling", person="pl-xiangling", fate="fate-xiangling",
         line="根并荷花一茎香，平生遭际实堪伤。自从两地生孤木，致使香魂返故乡。",
         omen="“两地生孤木”拆“桂”——夏金桂入门，香菱即尽",
         ending="第103回“施毒计金桂自焚身”，香菱难产而死（一说被折磨致病而亡）",
         verdict="存疑", scope="程高本第103回",
         note="拆字解“桂”无异议，但“香魂返故乡”究竟指惨死还是被父接回，"
              "脂批“香菱之死”与此不同；续书写金桂自焚、香菱反而扶正，"
              "与判词的悲音不符，故标存疑。"),
    dict(id="fs-xiren", person="pl-xiren", fate="fate-xiren",
         line="枉自温柔和顺，空云似桂如兰。堪羡优伶有福，谁知公子无缘。",
         omen="“优伶有福”指蒋玉菡；“公子无缘”指宝玉",
         ending="第120回，宝玉出家后，袭人嫁与蒋玉菡",
         verdict="续书", scope="程高本第120回",
         note="第28回宝玉与蒋玉菡互赠汗巾（茜香罗、松花汗巾）已伏此线，"
              "是“草蛇灰线”里最清楚的一条。"),
    dict(id="fs-zhongren", person="", fate="fate-jinling",
         line="正册十二人 + 副册（香菱）+ 又副册（晴雯、袭人）",
         omen="太虚幻境的簿册次序本身即判词：先主子后丫鬟，先正册后副册",
         ending="书中并未逐一交代，多数靠第5回判词与后文互证",
         verdict="存疑", scope="第5回",
         note="这一则不是谶语而是一张“名单”。把它单列，是因为读者最容易在这里"
              "混淆正册、副册、又副册的归属（如秦可卿属正册、香菱属副册、晴雯袭人属又副册）。"),
]


def wordplay_payloads():
    """转成 lore 表的 payload（去掉 id/kind，由外层保存）。"""
    out = []
    for w in WORDPLAY:
        payload = {k: v for k, v in w.items() if k not in ("id",)}
        out.append((w["id"], "wordplay", payload))
    return out


def foreshadow_payloads():
    out = []
    for f in FORESHADOW:
        payload = {k: v for k, v in f.items() if k not in ("id",)}
        out.append((f["id"], "foreshadow", payload))
    return out


# ------------------------------------------------------------------ 府邸图

MAP = {
    "title": "宁荣二府与大观园",
    "note": "示意图，非比例复原。方位只取书中有明文者：宁国府在街东、荣国府在街西；"
            "大观园在荣国府东北，借宁国府会芳园一带扩建（第16回）。院落的相对位置依"
            "第17回贾政游园次序与第40回贾母两宴大观园的行程推定，各条 basis 注明依据。",
    "refs": [
        "《红楼梦》第3回（黛玉进府路线）、第16回（建园）、第17回（游园题对额）、第40回（两宴大观园）",
        "《红楼梦大辞典》“荣国府”“宁国府”“大观园”诸条，文化艺术出版社",
        "周汝昌《红楼梦新证》大观园方位诸说；俞平伯《红楼梦辨》",
    ],
    "panels": [
        dict(id="rong", name="荣国府", sub="街西", x=52, y=70, w=348, h=528,
             note="贾母、贾赦、贾政三支同住一府，中路为贾政一房。"),
        dict(id="yuan", name="大观园", sub="荣府东北", x=412, y=70, w=210, h=528,
             note="第16回“从东边一带，借着东府里花园起，转至北边，一共丈量准了三里半大”。"),
        dict(id="ning", name="宁国府", sub="街东", x=634, y=70, w=310, h=528,
             note="贾敬、贾珍一支。会芳园在其西北，后并入大观园。"),
    ],
    "rooms": [
        # ---------------- 荣国府（街西，中路属贾政一房） ----------------
        dict(id="map-rong-gate", panel="rong", name="荣国府大门", kind="门",
             x=170, y=552, w=136, h=30, owner="",
             basis="第3回：黛玉自西角门入，正门平时不常开"),
        dict(id="map-rong-yimen", panel="rong", name="仪门 · 大厅", kind="厅",
             x=180, y=478, w=116, h=52, owner="",
             basis="第3回：轿子抬过仪门，至大厅后方落轿"),
        dict(id="map-rong-xitang", panel="rong", name="荣禧堂", kind="正堂",
             x=186, y=392, w=104, h=64, owner="pl-jiazheng",
             basis="第3回：御笔“荣禧堂”匾所在，贾政一房的正内室"),
        dict(id="map-rong-zheng", panel="rong", name="贾政 · 王夫人院", kind="正房",
             x=186, y=312, w=104, h=58, owner="pl-jiazheng",
             basis="第3回：王夫人日常居坐于荣禧堂东廊三间小正房"),
        dict(id="map-rong-jiamu", panel="rong", name="贾母院（荣庆堂）", kind="正房",
             x=70, y=352, w=94, h=104, owner="pl-jiamu",
             basis="第3回：进垂花门，穿抄手游廊，上房五间；黛玉自此院居止"),
        dict(id="map-rong-jiashe", panel="rong", name="贾赦院（黑油大门）", kind="正房",
             x=302, y=392, w=90, h=94, owner="pl-jiashe",
             basis="第3回：出垂花门往东，过荣府正门，入一黑油大门——原是荣府花园隔断过来的"),
        dict(id="map-rong-houlou", panel="rong", name="后楼 · 账房", kind="楼",
             x=186, y=228, w=104, h=50, owner="",
             basis="第7回：周瑞家的自后楼一带往来送宫花"),
        dict(id="map-rong-lian", panel="rong", name="贾琏 · 王熙凤院", kind="院落",
             x=302, y=300, w=90, h=58, owner="pl-wangxifeng",
             basis="第7回送宫花路线：自王夫人处往贾母处，先过凤姐院"),
        dict(id="map-rong-lixiang", panel="rong", name="梨香院", kind="院落",
             x=302, y=108, w=90, h=62, owner="pl-xueyima",
             basis="第4回：薛家寄居于此，西南角门通王夫人正房东边，另有一门通街"),

        # ---------------- 宁国府（街东，会芳园在西北，后并入大观园） ----------------
        dict(id="map-ning-gate", panel="ning", name="宁国府大门", kind="门",
             x=728, y=552, w=136, h=30, owner="",
             basis="第3回：宁荣二府大门东西相对，同在宁荣街"),
        dict(id="map-ning-tang", panel="ning", name="宁国府正堂", kind="正堂",
             x=744, y=460, w=112, h=80, owner="pl-jiazhen",
             basis="第13回秦氏之丧：灵柩停于会芳园登仙阁，正堂受吊"),
        dict(id="map-ning-zhen", panel="ning", name="贾珍 · 尤氏院", kind="正房",
             x=744, y=364, w=112, h=72, owner="pl-jiazhen",
             basis="第7回：焦大醉骂“每日偷狗戏鸡”，即指宁府内院"),
        dict(id="map-ning-rong", panel="ning", name="贾蓉 · 秦可卿院", kind="院落",
             x=744, y=280, w=112, h=62, owner="pl-qinkeqing",
             basis="第5回：宝玉随贾母至宁府赏梅，午睡于秦氏房中"),
        dict(id="map-ning-jiajing", panel="ning", name="贾敬院", kind="院落",
             x=866, y=364, w=66, h=100, owner="pl-jiajing",
             basis="第2回：贾敬一味好道，只在都中城外和道士胡羼，院中久空"),
        dict(id="map-ning-huifang", panel="ning", name="会芳园", kind="园林",
             x=648, y=108, w=180, h=140, owner="",
             basis="第11回：会芳园赏梅、登仙阁；第16回建大观园“借着东府里花园起”"),
        dict(id="map-ning-tianxiang", panel="ning", name="天香楼", kind="楼",
             x=866, y=476, w=66, h=64, owner="pl-qinkeqing",
             basis="第13回：秦氏自缢于天香楼（庚辰本脂批“淫丧天香楼”，今本已删）"),

        # ---------------- 大观园（荣府东北，借会芳园扩建；自上而下即第17回游园次序） ---
        dict(id="map-yuan-daguanlou", panel="yuan", name="大观楼 · 省亲别墅", kind="楼",
             x=466, y=88, w=104, h=48, owner="pl-jiayuanchun",
             basis="第18回元春省亲，正殿悬“顾恩思义”匾，为园之北部主景"),
        dict(id="map-yuan-ouxiang", panel="yuan", name="藕香榭 · 芦雪庵", kind="榭",
             x=456, y=150, w=124, h=38, owner="",
             basis="第38回螃蟹宴设于藕香榭；第49–50回芦雪庵联诗，皆近水"),
        dict(id="map-yuan-nuanxiang", panel="yuan", name="蓼风轩 · 暖香坞", kind="院落",
             x=420, y=206, w=88, h=46, owner="pl-xichun",
             basis="第50回：贾母至暖香坞看惜春画园；惜春居蓼风轩"),
        dict(id="map-yuan-qiushuang", panel="yuan", name="秋爽斋", kind="院落",
             x=518, y=206, w=88, h=46, owner="pl-tanchun",
             basis="第40回：贾母自潇湘馆至秋爽斋晓翠堂吃早饭，探春居此"),
        dict(id="map-yuan-ziling", panel="yuan", name="紫菱洲 · 缀锦楼", kind="楼",
             x=420, y=268, w=88, h=46, owner="pl-yingchun",
             basis="第79回宝玉《紫菱洲歌》，迎春出阁后所作；临水近缀锦阁"),
        dict(id="map-yuan-hengwu", panel="yuan", name="蘅芜苑", kind="院落",
             x=518, y=268, w=88, h=46, owner="pl-xuebaochai",
             basis="第17回第三处：无花只草、藤萝蔓引；第23回宝钗居此"),
        dict(id="map-yuan-daoxiang", panel="yuan", name="稻香村", kind="院落",
             x=420, y=330, w=88, h=46, owner="pl-livan",
             basis="第17回第二处：土墙茅屋、杏花菜畦，宝玉斥其“穿凿”；第23回李纨居此"),
        dict(id="map-yuan-longcui", panel="yuan", name="栊翠庵", kind="庵",
             x=518, y=330, w=88, h=46, owner="pl-miaoyu",
             basis="第41回：贾母携刘姥姥至栊翠庵品茶，妙玉居此"),
        dict(id="map-yuan-xiang", panel="yuan", name="潇湘馆", kind="院落",
             x=420, y=392, w=88, h=48, owner="pl-daiyu",
             basis="第17回游园第一处“有凤来仪”，后院植竹；第23回黛玉居此"),
        dict(id="map-yuan-yihong", panel="yuan", name="怡红院", kind="院落",
             x=518, y=392, w=88, h=48, owner="pl-baoyu",
             basis="第17回游园最后一处，与潇湘馆隔沁芳桥相对；第23回宝玉居此"),
        dict(id="map-yuan-qinfang", panel="yuan", name="沁芳亭 · 桥", kind="桥",
             x=466, y=456, w=104, h=34, owner="",
             basis="第17回：引沁芳闸之水入园，宝玉题“沁芳”，为园中枢纽"),
        dict(id="map-yuan-qujing", panel="yuan", name="曲径通幽（假山）", kind="景",
             x=466, y=506, w=104, h=32, owner="",
             basis="第17回：进门迎面假山，是全书最著名的一处障景"),
        dict(id="map-yuan-gate", panel="yuan", name="大观园正门", kind="门",
             x=472, y=552, w=92, h=30, owner="",
             basis="第17回：贾政自正门入园；第18回元春省亲亦由此入"),
        # 书中提到但无法可靠定位的两处，列为“未定位景点”
        dict(id="map-yuan-tubi", panel="yuan", name="凸碧山庄 · 凹晶溪馆", kind="景",
             x=0, y=0, w=0, h=0, owner="", unplaced=True,
             basis="第75–76回中秋赏月：凸碧在山脊、凹晶在近水低处，一高一低相对；方位无明文"),
        dict(id="map-yuan-dicui", panel="yuan", name="滴翠亭 · 蜂腰桥", kind="亭",
             x=0, y=0, w=0, h=0, owner="", unplaced=True,
             basis="第27回宝钗扑蝶于滴翠亭，正当潇湘馆与怡红院之间的水边；方位无明文"),
    ],
}
