#!/usr/bin/env python3
"""生成 db/seed.json —— 红楼梦图谱的初始内容。

数据是人工整理的，不抓取原文；判词、诗词取通行本文字，节选处已标注。
改完重跑本脚本，再执行 python3 db/init_db.py --force。
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import enrich_data as ENRICH

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

FAMILIES = [
    {"id": "rong", "name": "荣国府", "color": "#a8352a", "note": "贾母次子贾政一支，大观园所在"},
    {"id": "ning", "name": "宁国府", "color": "#8a4a3f", "note": "贾敬、贾珍一支，秦可卿之丧、天香楼事"},
    {"id": "shi", "name": "史家", "color": "#2f6457", "note": "保龄侯史家，贾母娘家，湘云出身"},
    {"id": "wang", "name": "王家", "color": "#9a6a35", "note": "王夫人、王熙凤、王子腾一族"},
    {"id": "xue", "name": "薛家", "color": "#6b5b8c", "note": "皇商薛家，宝钗、薛蟠"},
    {"id": "lin", "name": "林家", "color": "#3f6b8a", "note": "林如海、贾敏一支，黛玉出身"},
    {"id": "other", "name": "方外与外人", "color": "#6b6458", "note": "僧道、清客、乡邻与优伶"},
]

ROLES = ["主子", "妾室", "丫鬟", "仆役", "小厮", "清客", "亲戚", "僧道", "外人"]

P = []
R = []


def person(id, name, **kw):
    P.append(dict(id=id, cat="people", name=name, **kw))


def rel(a, b, label):
    R.append({"a": a, "b": b, "label": label})


# ---------------- 荣国府 ----------------
person("pl-jiamu", "贾母", alias="史太君", family="rong", role="主子",
       summary="荣国府老祖宗，史家之女，贾赦、贾政之母，宝玉的祖母。",
       detail="贾母出身保龄侯史家，嫁入贾府数十年，是全书地位最高的长辈。她溺爱宝玉，也最疼爱黛玉，是宝黛在府中最重要的庇护者。晚年目睹家道败落，病中散尽私蓄，终至不起。",
       tags=["老祖宗", "史家女", "宝黛庇护"])
person("pl-jiashe", "贾赦", family="rong", role="主子", type="主子",
       summary="贾母长子，袭荣国公，性好货贪色，邢夫人之夫，贾琏、迎春之父。",
       detail="贾赦承袭荣国府的爵位，却不得贾母欢心，居所与贾政一支分列。他逼娶鸳鸯、强买石呆子扇子，是府中败落的推手之一。",
       tags=["袭爵", "贪色"])
person("pl-xingfuren", "邢夫人", family="rong", role="主子",
       summary="贾赦之妻，迎春的嫡母，邢岫烟的姑母，为人吝啬刻薄。",
       detail="邢夫人在府中地位尴尬，既非贾母所喜，又与儿媳王熙凤不睦。她替贾赦出面说合鸳鸯，碰壁后迁怒于人。",
       tags=["嫡母"])
person("pl-jiazheng", "贾政", family="rong", role="主子",
       summary="贾母次子，工部员外郎，宝玉之父，以方正守礼著称。",
       detail="贾政是府中唯一正经仕宦的人，重科举、守礼法，对宝玉极严，笞挞几死。然而他识人不明、治家无方，抄家时亦有失察之责。",
       tags=["仕宦", "严父"])
person("pl-wangfuren", "王夫人", family="wang", role="主子",
       summary="贾政之妻，元春、贾珠、宝玉之母，王子腾之妹，薛姨妈之姐。",
       detail="王夫人表面吃斋念佛，实则手段果断：逐晴雯、撵金钏（金钏投井）、清查怡红院，都出自她的意思。她是宝钗的姨母，也是金玉良姻的重要推手。",
       tags=["王夫人", "抄检", "金玉良姻"])
person("pl-jiayuanchun", "贾元春", alias="贤德妃", family="rong", role="主子",
       summary="贾政长女，入宫封贤德妃，大观园即为其省亲而建。",
       detail="元春是贾府最后的荣光。省亲时“当日既送我到那不得见人的去处”一句，道尽宫墙之苦。她早逝，贾府的政治靠山随之倾塌。",
       tags=["贤德妃", "省亲"])
person("pl-jiazhu", "贾珠", family="rong", role="主子",
       summary="贾政长子，早亡，李纨之夫，贾兰之父。",
       detail="贾珠十四岁进学，二十岁上下病故。他的早逝使李纨青年守寡，也使宝玉成为贾政唯一的嫡子指望。",
       tags=["早亡"])
person("pl-livan", "李纨", alias="宫裁", family="rong", role="主子",
       summary="贾珠之妻，青年守寡，抚育贾兰，号稻香老农，红楼诗社社长。",
       detail="李纨恪守妇道，日子过得清苦自持，被下人称作“菩萨”。她主持海棠诗社，评诗公允。判词“到头谁似一盆兰”，暗示贾兰终得功名，而她已无缘享受。",
       tags=["寡妇", "诗社", "稻香老农"])
person("pl-jialan", "贾兰", family="rong", role="主子",
       summary="贾珠与李纨之子，宝玉的侄儿，勤学上进。",
       detail="贾兰在书中戏份不多，却以“爵禄高登”收束贾府第三代的希望。续书安排他中举，与宝玉出家形成对照。",
       tags=["科举", "第三代"])
person("pl-jialian", "贾琏", family="rong", role="主子",
       summary="贾赦之子，王熙凤之夫，捐同知，在府中管外务。",
       detail="贾琏好色贪财，偷娶尤二姐、私通鲍二家的，屡被凤姐捉住。但他也有办差的实务能力，护送黛玉南下、协理宁府丧事，都是他出面。",
       tags=["凤姐之夫", "偷娶尤二姐"])
person("pl-wangxifeng", "王熙凤", alias="凤姐、凤辣子", family="wang", role="主子",
       summary="贾琏之妻，王夫人侄女，荣国府实际当家人，精明泼辣，口才凌厉。",
       detail="凤姐是全书最有行动力的人物：协理宁国府、弄权铁槛寺、放高利贷、逼死尤二姐，一手遮天。判词“一从二令三人木，哭向金陵事更哀”，预示她被休弃、事败而亡。",
       tags=["当家", "泼辣", "机关算尽"])
person("pl-qiaojie", "巧姐", family="rong", role="主子",
       summary="贾琏与王熙凤之女，后因刘姥姥搭救脱离险境。",
       detail="巧姐的名字由刘姥姥所取，取“巧”字以祈平安。贾府败落后，她险被舅舅王仁等卖入烟花，最终由刘姥姥救出，嫁与农家。判词“偶因济刘氏，巧得遇恩人”。",
       tags=["刘姥姥救命"])
person("pl-pinger", "平儿", family="rong", role="丫鬟",
       summary="王熙凤的通房大丫头，贾琏之妾，为人周全厚道。",
       detail="平儿夹在凤姐与贾琏之间，处处周全，是府中少见的“有权而不弄权”者。凤姐病中、事发之后，她仍守住本分，续书则以她被扶正作结。",
       tags=["通房", "周全"])
person("pl-yingchun", "贾迎春", alias="二木头", family="rong", role="主子",
       summary="贾赦之女，性懦弱，人称“二木头”，后嫁孙绍祖受虐而死。",
       detail="迎春在诗社中少有佳作，凡事退让。父亲贾赦为抵债将她许给孙绍祖，婚后备受凌辱，不到一年便亡。判词“子系中山狼，得志便猖狂”。",
       tags=["懦弱", "孙绍祖", "薄命"])
person("pl-tanchun", "贾探春", alias="蕉下客", family="rong", role="主子",
       summary="贾政与赵姨娘之女，精明果决，理家兴利，后远嫁。",
       detail="探春是庶出，却最有才具：抄检大观园时当众驳斥王善保家的，理家时兴利除弊。判词“清明涕送江边望，千里东风一梦遥”，暗示远嫁不归。",
       tags=["庶出", "理家", "远嫁"])
person("pl-xichun", "贾惜春", alias="藕榭", family="ning", role="主子",
       summary="贾敬之女，贾珍之妹，性冷僻，善画，后出家为尼。",
       detail="惜春自幼在荣府长大，看透宁府污浊，常说“我不了悟，也断不能了”。抄检大观园时她逐走入画，最终剪发出家。判词“独卧青灯古佛旁”。",
       tags=["出家", "善画"])
person("pl-baoyu", "贾宝玉", alias="怡红公子、绛洞花王", family="rong", role="主子",
       summary="贾政与王夫人次子，衔玉而生，全书中心人物，鄙弃功名，重情。",
       detail="宝玉视科举功名为“禄蠹”，与黛玉相知最深，最终在家族安排下娶宝钗。历经抄家、黛玉之死、大观园风流云散，于结局出家。其“通灵宝玉”是全书象征核心。",
       tags=["衔玉", "情不情", "出家"])
person("pl-zhaoyiniang", "赵姨娘", family="rong", role="妾室",
       summary="贾政之妾，探春、贾环之母，性愚悍，屡生事端。",
       detail="赵姨娘出身卑微，行事粗鄙，曾以魇魔法害宝玉与凤姐，又与芳官等厮打。她的处境写出妾室在大家族中的扭曲。",
       tags=["妾室", "魇魔法"])
person("pl-jiahuan", "贾环", family="rong", role="主子",
       summary="贾政与赵姨娘之子，宝玉异母弟，心性狭隘，曾以蜡灯烫伤宝玉。",
       detail="贾环在府中地位低微，常受冷落，遂生忌恨。他与母亲赵姨娘一起，构成荣府内部的暗流。",
       tags=["庶出", "忌恨"])

# ---------------- 宁国府 ----------------
person("pl-jiajing", "贾敬", family="ning", role="主子",
       summary="宁国府当家，进士出身，却一味好道炼丹，不理家事。",
       detail="贾敬把爵位让给贾珍，自己住在都外玄真观烧丹炼汞，最终因服丹而亡。宁府的失序，从他这一代就已开始。",
       tags=["好道", "服丹而亡"])
person("pl-jiazhen", "贾珍", family="ning", role="主子",
       summary="贾敬之子，宁国府当家，荒淫无度，与秦可卿事有牵连。",
       detail="贾珍为秦可卿大办丧事，“尽我所有”，排场逾制；又与尤二姐、尤三姐有纠葛。宁府的污名，多由他而来。",
       tags=["宁府当家", "秦可卿之丧"])
person("pl-youshi", "尤氏", family="ning", role="主子",
       summary="贾珍之妻，性情懦弱，尤二姐、尤三姐之异母姐。",
       detail="尤氏在宁府说话没有分量，秦可卿之丧、贾珍胡为，她都无力阻拦。",
       tags=["继室"])
person("pl-jiarong", "贾蓉", family="ning", role="主子",
       summary="贾珍之子，秦可卿之夫，捐龙禁尉，轻薄无行。",
       detail="贾蓉与父亲一同胡闹，妻子秦可卿死后又娶胡氏。他是宁府第三代堕落的样本。",
       tags=["龙禁尉"])
person("pl-qinkeqing", "秦可卿", family="ning", role="主子",
       summary="贾蓉之妻，警幻仙姑之妹，貌美温婉，早逝，丧事极尽排场。",
       detail="秦可卿出身养生堂，嫁入宁府后得上下喜爱。她的病与死是全书一大关节，脂批有“秦可卿淫丧天香楼”之说。判词“情既相逢必主淫”“造衅开端实在宁”。",
       tags=["天香楼", "薄命", "太虚幻境"])
person("pl-qinzhong", "秦钟", family="ning", role="亲戚",
       summary="秦可卿之弟，宝玉同学，容貌清秀，早夭。",
       detail="秦钟与宝玉在学堂相识，情谊亲密。姐姐死后他病上加病，又因与智能儿事败受责，不久身亡。",
       tags=["宝玉同学", "早夭"])
person("pl-qinye", "秦业", family="ning", role="亲戚",
       summary="秦可卿、秦钟之父，营缮郎，寒门小官。",
       detail="秦业从养生堂抱养可卿，晚年得子秦钟。他严责秦钟，反致其病重。",
       tags=["营缮郎"])

# ---------------- 林黛玉一家 ----------------
person("pl-daiyu", "林黛玉", alias="潇湘妃子、颦儿", family="lin", role="主子",
       summary="林如海与贾敏之女，宝玉的表妹与知己，才情绝世，多愁善感。",
       detail="黛玉六岁丧母，入贾府依外祖母。她与宝玉心有灵犀，却始终没有父母之命可依。诗才为姐妹之冠，《葬花吟》《秋窗风雨夕》皆出她手。最终在宝玉娶宝钗之夜焚稿断痴情而亡。判词与宝钗合写：“玉带林中挂，金簪雪里埋”。",
       tags=["绛珠仙草", "还泪", "葬花", "焚稿"])
person("pl-jiamin", "贾敏", family="lin", role="亲戚",
       summary="贾母之女，林如海之妻，黛玉之母，早亡。",
       detail="贾敏早逝，是黛玉入贾府的直接原因。书中对她着墨不多，却是连接贾、林两家的关键。",
       tags=["早亡"])
person("pl-linruhai", "林如海", family="lin", role="亲戚",
       summary="黛玉之父，前科探花，任巡盐御史，病逝于扬州。",
       detail="林如海出身书香门第，钟爱黛玉，延请贾雨村为塾师。他病重时托贾琏护送黛玉入京，不久去世，黛玉自此彻底寄人篱下。",
       tags=["巡盐御史", "探花"])

# ---------------- 薛家 ----------------
person("pl-xuebaochai", "薛宝钗", alias="蘅芜君", family="xue", role="主子",
       summary="薛姨妈之女，宝玉的表姐，端庄稳重，博学多识，终成宝玉之妻。",
       detail="宝钗识大体、通世务，处处以“停机德”自持。她劝宝玉留心仕途，与黛玉的相知形成对照。金锁与通灵宝玉成“金玉良姻”之说。婚后宝玉出家，她独守空闺。判词“金簪雪里埋”。",
       tags=["金玉良姻", "停机德", "博学"])
person("pl-xueyima", "薛姨妈", family="xue", role="亲戚",
       summary="薛蟠、宝钗之母，王夫人之妹，客居贾府。",
       detail="薛姨妈因儿子人命官司入京，寄居梨香院，是金玉良姻的推动者之一。",
       tags=["王夫人之妹"])
person("pl-xuepan", "薛蟠", alias="呆霸王", family="xue", role="主子",
       summary="薛姨妈之子，宝钗之兄，纨绔霸道，打死冯渊后逍遥法外。",
       detail="薛蟠为争香菱纵奴打死冯渊，靠贾雨村徇情了结。他经商屡败、惹事不断，娶夏金桂后家宅不宁。",
       tags=["呆霸王", "人命案"])
person("pl-xiajingui", "夏金桂", family="xue", role="主子",
       summary="薛蟠之妻，桂花夏家之女，性泼悍善妒，折磨香菱。",
       detail="夏金桂嫁入薛家后挟制丈夫、欺凌香菱，最终自食其果，误饮毒汤而死。",
       tags=["泼悍", "妒妇"])
person("pl-xiangling", "香菱", alias="甄英莲", family="xue", role="妾室",
       summary="原甄士隐之女，幼年被拐，后为薛蟠之妾，苦志学诗。",
       detail="香菱是全书“薄命”的缩影：本是乡宦之女，被拐子卖入薛家，受夏金桂折磨。她向黛玉学诗，苦吟成篇，是书中最动人的一段温情。判词“自从两地生孤木，致使香魂返故乡”。",
       tags=["甄英莲", "被拐", "学诗", "薄命"])
person("pl-xueke", "薛蝌", family="xue", role="亲戚",
       summary="薛蟠堂弟，薛宝琴之兄，端方稳重。",
       detail="薛蝌与薛蟠形成对照：同样出身皇商之家，却能守礼持正，后娶邢岫烟。",
       tags=["端方"])
person("pl-xuebaoqin", "薛宝琴", family="xue", role="亲戚",
       summary="薛蝌之妹，薛蟠堂妹，容貌才情俱佳，曾随父行商见闻广博。",
       detail="宝琴入府后极受贾母喜爱，作《怀古绝句》十首。她已许配梅翰林之子，是府中少有的“有归宿”的女儿。",
       tags=["怀古绝句"])

# ---------------- 史家 ----------------
person("pl-xiangyun", "史湘云", alias="枕霞旧友", family="shi", role="亲戚",
       summary="贾母侄孙女，保龄侯史家之女，豪爽率真，诗才敏捷。",
       detail="湘云父母早亡，由叔父抚养，常来贾府小住。她醉眠芍药裀、芦雪庵联句，是园中最明快的一抹亮色。判词“展眼吊斜晖，湘江水逝楚云飞”。",
       tags=["豪爽", "醉眠芍药", "联句"])

# ---------------- 王家 ----------------
person("pl-wangziteng", "王子腾", family="wang", role="亲戚",
       summary="王夫人之兄，王熙凤之叔，官至九省都检点，贾府重要的外援。",
       detail="王子腾虽未正式登场，却始终是贾府在朝中的靠山。他一死，贾府随即失去庇护，抄家随之而来。",
       tags=["九省都检点", "贾府外援"])

# ---------------- 亲戚与外人 ----------------
person("pl-yousanjie", "尤三姐", family="other", role="亲戚",
       summary="尤二姐之妹，性情刚烈，因柳湘莲退婚而自刎。",
       detail="尤三姐寄居宁府，看透贾珍、贾琏之流，独钟情于柳湘莲。柳湘莲听信闲言、以鸳鸯剑退婚，她当场自刎以明志。",
       tags=["刚烈", "自刎", "鸳鸯剑"])
person("pl-youerjie", "尤二姐", family="other", role="亲戚",
       summary="尤氏异母妹，被贾琏偷娶为二房，遭王熙凤折磨吞金自逝。",
       detail="贾琏在花枝巷偷娶尤二姐，凤姐闻知后假意接她入府，暗中挑拨、逼迫，终致她吞金而死。",
       tags=["偷娶", "吞金"])
person("pl-xingxiuyan", "邢岫烟", family="other", role="亲戚",
       summary="邢夫人侄女，家境寒素而性情淡泊，后嫁薛蝌。",
       detail="岫烟寄居贾府，贫而不失自尊，典衣度日亦不诉苦。她与妙玉有旧交，是园中少见的“清贫自守”者。",
       tags=["寒素", "清贫自守"])
person("pl-miaoyu", "妙玉", alias="槛外人", family="other", role="僧道",
       summary="栊翠庵带发修行的尼姑，出身读书仕宦之家，清高孤傲，十二钗之一。",
       detail="妙玉才华出众、洁癖极深，却对宝玉另眼相看。判词“欲洁何曾洁，云空未必空。可怜金玉质，终陷淖泥中”，预示其结局的污浊。",
       tags=["栊翠庵", "槛外人", "洁癖"])
person("pl-liuxianglian", "柳湘莲", alias="冷二郎", family="other", role="外人",
       summary="世家子弟，擅串戏，性情豪爽，尤三姐未婚夫，后随道人出家。",
       detail="柳湘莲痛打薛蟠，又与宝玉交好。他许婚尤三姐后又反悔索剑，致三姐自刎，遂截发出家。",
       tags=["冷二郎", "出家"])
person("pl-jiangyuhan", "蒋玉菡", alias="琪官", family="other", role="外人",
       summary="名伶，宝玉好友，后娶袭人。",
       detail="蒋玉菡为忠顺王府所蓄优伶，与宝玉交换汗巾。宝玉因此挨打。续书安排他娶袭人，应了“堪羡优伶有福”。",
       tags=["琪官", "优伶", "袭人后夫"])
person("pl-zhenshiyin", "甄士隐", family="other", role="外人",
       summary="姑苏乡宦，香菱之父，梦识通灵，后随跛足道人出家。",
       detail="甄士隐家道中落、女儿被拐、房舍被焚，最终在《好了歌》中悟道出家。他与贾雨村一“真”一“假”，构成全书起结。",
       tags=["真事隐", "好了歌", "出家"])
person("pl-jiayucun", "贾雨村", family="other", role="外人",
       summary="湖州穷儒，得甄士隐资助中举，后为黛玉塾师、应天府尹。",
       detail="贾雨村是全书官场线索的贯穿者：乱判葫芦案、攀附贾王两家，贾府败后又落井下石。名“雨村”对“士隐”，一假一真。",
       tags=["假语存", "葫芦案", "攀附"])
person("pl-liulaolao", "刘姥姥", family="other", role="外人",
       summary="乡下老妇，王夫人远亲，三进荣国府，最终救出巧姐。",
       detail="刘姥姥是全书最重要的“外部视角”：借她眼中写出贾府的富贵与虚骄。家败之后，她却成了巧姐的恩人。",
       tags=["三进荣国府", "救巧姐"])
person("pl-baner", "板儿", family="other", role="外人",
       summary="刘姥姥外孙，随姥姥进府，与巧姐换柚子佛手。",
       detail="板儿的顽童形象与贾府公子形成对照；他与巧姐互换佛手、柚子的细节，被后人视为姻缘伏笔。",
       tags=["乡下孩童"])
person("pl-jiaoda", "焦大", family="ning", role="仆役",
       summary="宁国府老仆，随先祖征战有功，醉后痛骂宁府子孙。",
       detail="焦大醉骂“爬灰的爬灰，养小叔子的养小叔子”，是全书最尖锐的一次揭底，也暗示宁府之丑。",
       tags=["老仆", "醉骂"])
person("pl-laida", "赖大", family="rong", role="仆役",
       summary="荣国府大管家，其家亦富贵，子孙捐官。",
       detail="赖大一家是贾府豪奴的代表：赖嬷嬷、赖大、赖尚荣三代，靠主子发迹，也印证“主仆一体”的寄生结构。",
       tags=["大管家", "豪奴"])
person("pl-yizengyidao", "一僧一道", alias="茫茫大士、渺渺真人", family="other", role="僧道",
       summary="贯穿全书的神异僧道，携通灵宝玉入世，屡次点化世人。",
       detail="一僧一道是《石头记》的叙事起点与终点：他们将顽石携入红尘，又在结尾度化甄士隐、贾宝玉。",
       tags=["茫茫大士", "渺渺真人", "点化"])
person("pl-jinghuan", "警幻仙姑", family="other", role="僧道",
       summary="太虚幻境之主，掌人间风月情债，引宝玉梦游幻境。",
       detail="宝玉在秦可卿房中入梦，随警幻仙姑游太虚幻境，得见金陵十二钗册子、听《红楼梦》十二支曲，是全书结构的总纲。",
       tags=["太虚幻境", "十二钗册"])
person("pl-kongkong", "空空道人", family="other", role="僧道",
       summary="抄录《石头记》的道人，后改名情僧。",
       detail="空空道人见石上故事，抄录传世，因“因空见色，由色生情，传情入色，自色悟空”，遂改名情僧。",
       tags=["石头记", "情僧"])

# ---------------- 丫鬟 ----------------
person("pl-xiren", "袭人", alias="珍珠、花袭人", family="rong", role="丫鬟",
       summary="宝玉的贴身大丫鬟，后为宝玉之妾，性情温顺周全。",
       detail="袭人原为贾母之婢，后予宝玉。她处处为宝玉打算，也曾向王夫人进言。判词“枉自温柔和顺，空云似桂如兰。堪羡优伶有福，谁知公子无缘”，结局嫁与蒋玉菡。",
       tags=["大丫鬟", "温柔和顺", "蒋玉菡"])
person("pl-qingwen", "晴雯", family="rong", role="丫鬟",
       summary="宝玉房中丫鬟，容貌出众、口齿锋利，被逐后病死。",
       detail="晴雯心高气傲，撕扇、补雀金裘都见其性。王夫人以“狐狸精”之名逐出，她病中与宝玉诀别，死后宝玉作《芙蓉女儿诔》。判词“心比天高，身为下贱”。",
       tags=["撕扇", "补裘", "被逐", "芙蓉诔"])
person("pl-sheyue", "麝月", family="rong", role="丫鬟",
       summary="宝玉房中丫鬟，稳重可靠，是最后留在宝玉身边的人之一。",
       detail="麝月言语不多而行事得体，晴雯、袭人相继离去后，她仍守着怡红院。",
       tags=["怡红院"])
person("pl-ziyuan", "紫鹃", family="lin", role="丫鬟",
       summary="黛玉的贴身丫鬟，忠心机敏，最知黛玉心事。",
       detail="紫鹃原为贾母房中人，后服侍黛玉。她试探宝玉真心，又在黛玉病中奔走。黛玉死后，她随惜春出家。",
       tags=["忠心", "试玉"])
person("pl-xueyan", "雪雁", family="lin", role="丫鬟",
       summary="黛玉从苏州带来的小丫鬟，年幼单纯。",
       detail="雪雁是黛玉从南方带来的唯一旧人，象征黛玉与故乡最后的联系。",
       tags=["苏州旧人"])
person("pl-yinger", "莺儿", alias="黄金莺", family="xue", role="丫鬟",
       summary="宝钗的丫鬟，手巧善编花篮，曾泄露金锁之说。",
       detail="莺儿在“比通灵”一回中说出金锁与宝玉上的字“是一对”，是金玉良姻的第一次明写。",
       tags=["金锁", "巧手"])
person("pl-yuanyang", "鸳鸯", family="rong", role="丫鬟",
       summary="贾母的贴身大丫鬟，掌贾母私蓄，刚烈有主见，拒嫁贾赦。",
       detail="贾赦欲娶鸳鸯为妾，她当众铰发立誓不嫁，宁死不做妾。贾母死后，她自缢殉主。",
       tags=["拒婚", "刚烈", "殉主"])
person("pl-jinchuan", "金钏", family="wang", role="丫鬟",
       summary="王夫人房中丫鬟，因与宝玉戏语被逐，投井而死。",
       detail="金钏一句“金簪子掉在井里头”，竟成谶语。她被王夫人掌掴逐出后投井，宝玉因此挨打，也为王夫人留下心结。",
       tags=["投井", "被逐"])
person("pl-yuchuan", "玉钏", family="wang", role="丫鬟",
       summary="金钏之妹，仍在王夫人房中，曾受宝玉温存赔情。",
       detail="玉钏承受姐姐之死的伤痛，宝玉借尝莲叶羹向她赔罪。姐妹二人是府中丫鬟命运的一体两面。",
       tags=["金钏之妹"])
person("pl-siqi", "司棋", family="rong", role="丫鬟",
       summary="迎春的丫鬟，性情刚烈，因与表弟潘又安私情败露被逐。",
       detail="抄检大观园时，司棋箱中搜出私物与书信，被逐出府。续书她撞墙而死，潘又安亦自刎，是园中最惨烈的一对。",
       tags=["抄检", "私情", "刚烈"])
person("pl-shishu", "侍书", family="rong", role="丫鬟",
       summary="探春的丫鬟，机敏得体。",
       detail="侍书陪探春理家、应对抄检，言行有分寸，与主子相称。",
       tags=["秋爽斋"])
person("pl-ruhua", "入画", family="ning", role="丫鬟",
       summary="惜春的丫鬟，因替兄收藏财物被逐。",
       detail="抄检时入画箱中查出金银锞子，惜春不肯回护，执意撵出，可见其“冷”。",
       tags=["抄检", "被逐"])
person("pl-xiaohong", "小红", alias="林红玉", family="rong", role="丫鬟",
       summary="怡红院小丫鬟，口齿伶俐，后得王熙凤赏识。",
       detail="小红不甘埋没，抓住替凤姐传话的机会脱颖而出。她与贾芸的姻缘，是府中少见的“自己成全自己”。",
       tags=["伶俐", "贾芸"])
person("pl-fangguan", "芳官", family="rong", role="丫鬟",
       summary="梨香院十二戏子之一，后归宝玉房中，性娇憨。",
       detail="芳官改名“耶律雄奴”，与赵姨娘厮打，后被王夫人逐出，随水月庵尼姑出家。",
       tags=["戏子", "被逐"])
person("pl-lingguan", "龄官", family="rong", role="丫鬟",
       summary="十二戏子之一，唱腔最佳，痴情于贾蔷。",
       detail="龄官在蔷薇架下画“蔷”字，雨中痴立，是“情”字的另一重写照。她不唱《游园》《惊梦》，自有风骨。",
       tags=["戏子", "画蔷"])
person("pl-ouguan", "藕官", family="rong", role="丫鬟",
       summary="十二戏子之一，与菂官有情，后在园中烧纸祭奠。",
       detail="藕官与菂官假戏真做，菂官死后仍按时祭奠，被宝玉视为“情”的另一种形态。",
       tags=["戏子", "痴情"])
person("pl-liuwuer", "柳五儿", family="rong", role="丫鬟",
       summary="厨役柳嫂子之女，体弱貌美，欲进怡红院当差，含冤病亡。",
       detail="五儿因玫瑰露、茯苓霜一案被牵连，虽得平反，终究命薄。她的遭遇写出府中下层的倾轧。",
       tags=["含冤"])

# ---------------- 贾府先祖（谱系图用） ----------------
person("pl-jiayan", "贾演", alias="宁国公", family="ning", role="主子",
       summary="宁国府始封祖，与弟贾源同以军功封公。",
       detail="贾演封宁国公，居宁国府，是宁府一脉的源头。书中只在宗祠与谱系中被提及，却决定了宁府的地位。",
       tags=["宁国公", "始封祖"])
person("pl-jiayuan", "贾源", alias="荣国公", family="rong", role="主子",
       summary="荣国府始封祖，贾演之弟，以军功封荣国公。",
       detail="贾源封荣国公，居荣国府。荣府的全部荣华与亏空，都从这一代的军功与赐田开始。",
       tags=["荣国公", "始封祖"])
person("pl-jiadaihua", "贾代化", alias="宁国公世袭", family="ning", role="主子",
       summary="宁府第二代，贾演之子，贾敬之父。",
       detail="贾代化承袭宁国公，书中着墨极少，是宁府由盛转衰的过渡一代。",
       tags=["第二代"])
person("pl-jiadaishan", "贾代善", alias="荣国公世袭", family="rong", role="主子",
       summary="荣府第二代，贾源之子，贾母之夫，贾赦、贾政、贾敏之父。",
       detail="贾代善承袭荣国公，娶史家小姐（即贾母）。他早逝，贾母守寡持家数十年。",
       tags=["第二代", "贾母之夫"])
person("pl-jiafu", "贾敷", family="ning", role="主子",
       summary="宁府第三代，贾代化长子，八九岁上便死了。",
       detail="贾敷早夭，宁府的爵位因此落到弟弟贾敬身上，这一支的走向从此改变。",
       tags=["早夭"])
person("pl-shigong", "史公", alias="保龄侯", family="shi", role="主子",
       summary="史家始封祖，保龄侯，贾母之父。",
       detail="史公以军功封保龄侯，史家与贾、王、薛并称四大家族。贾母即是他的女儿。",
       tags=["保龄侯", "贾母之父"])

person("pl-wanggong", "王公", alias="县伯", family="wang", role="主子",
       summary="王家始封祖，封县伯，王夫人、薛姨妈、王子腾之父。",
       detail="王家以武功起家，王公封县伯。四大家族中王家权势最盛时，王子腾官至九省都检点。",
       tags=["县伯", "始封祖"])
person("pl-xuegong", "薛公", alias="紫薇舍人", family="xue", role="主子",
       summary="薛家始封祖，官紫薇舍人，为皇商，领内府帑银行商。",
       detail="薛家世代为皇商，薛公这一代最盛。到薛蟠时只剩银子与官司，家声早不如前。",
       tags=["紫薇舍人", "皇商"])


# ---------------- 族中旁支 ----------------
person("pl-jiadairu", "贾代儒", family="ning", role="主子",
       summary="贾氏族中长辈，家塾塾师，贾瑞之祖。",
       detail="贾代儒是贾代化一辈的族兄弟，掌管贾府家塾，课徒极严而不得法。孙子贾瑞被他管束过紧，反生邪念，终至丧命。",
       tags=["家塾", "族中长辈"])
person("pl-jiarui", "贾瑞", alias="贾天祥", family="ning", role="主子",
       summary="贾代儒之孙，痴恋王熙凤，被相思局所害，正照风月鉴而死。",
       detail="贾瑞在会芳园遇见凤姐，屡次纠缠，反被凤姐设局捉弄，冻饿受辱而病。跛足道人赠“风月宝鉴”，嘱其只照背面，他却只照正面，终至精尽而亡。此事是全书“情”之妄的一记警钟。",
       tags=["风月宝鉴", "相思局", "痴妄"])
person("pl-jiaqiang", "贾蔷", family="ning", role="主子",
       summary="宁府正派玄孙，自幼随贾珍过活，与龄官有情。",
       detail="贾蔷生得风流俊俏，靠贾珍、贾蓉照应，曾下姑苏采买戏子。他与龄官相恋，龄官画“蔷”正为此人。",
       tags=["龄官", "采买戏子"])
person("pl-jiayun", "贾芸", family="rong", role="主子",
       summary="荣府旁支子弟，机变能干，得凤姐差事，与小红有情。",
       detail="贾芸西廊下五嫂子之子，先求贾琏不成，转送凤姐冰麝得种树差事。他与小红以手帕传情，是府中少见的“自己挣出路”的年轻人。",
       tags=["种树差事", "小红", "机变"])
person("pl-jiaqin", "贾芹", family="rong", role="主子",
       summary="贾府旁支，管领家庙和尚道士，好赌贪财。",
       detail="贾芹靠母亲周氏求凤姐得了管理小沙弥、小道士的差事，却在铁槛寺聚赌，后被人告发。",
       tags=["家庙", "聚赌"])

# ---------------- 妾室与姻亲 ----------------
person("pl-zhouyiniang", "周姨娘", family="rong", role="妾室",
       summary="贾政之妾，安分守己，无子女。",
       detail="周姨娘在书中几乎没有戏份，与赵姨娘的张扬形成对照：同样是妾，一个安分，一个生事。",
       tags=["妾室", "安分"])
person("pl-hushi", "胡氏", family="ning", role="主子",
       summary="贾蓉续弦之妻，秦可卿死后入府。",
       detail="胡氏在续书中出场，是宁府第四代的媳妇，存在感极低，反衬秦可卿之死的余波。",
       tags=["续弦"])
person("pl-sunshaozu", "孙绍祖", family="other", role="外人",
       summary="迎春之夫，大同府人，武职出身，暴虐成性。",
       detail="孙绍祖以五千两银子相挟娶迎春，婚后“作践”至极。迎春回门哭诉“我不信我的命就这么苦”，不到一年即亡。判词“子系中山狼”即指此人。",
       tags=["中山狼", "迎春之死"])
person("pl-youlaniang", "尤老娘", family="other", role="亲戚",
       summary="尤氏继母，尤二姐、尤三姐之母，带女寄居宁府。",
       detail="尤老娘贪图宁府接济，对女儿的名节疏于保护，二姐、三姐的悲剧与她有直接关系。",
       tags=["尤氏继母"])
person("pl-liwen", "李纹", family="other", role="亲戚",
       summary="李纨堂妹，随母入府，参与诗社。",
       detail="李纹与妹妹李绮同来贾府，容貌才情俱佳，诗社中亦有作品。她们的出现使大观园的青春群像更完整。",
       tags=["李纨堂妹", "诗社"])
person("pl-liqi", "李绮", family="other", role="亲戚",
       summary="李纨堂妹，李纹之妹，后嫁甄宝玉。",
       detail="李绮在诗社中出场不多，续书安排她嫁与甄宝玉，与宝玉、宝钗一线形成镜像。",
       tags=["李纨堂妹", "甄宝玉"])

# ---------------- 僧道与方外 ----------------
person("pl-jingxu", "净虚", family="other", role="僧道",
       summary="馒头庵（水月庵）老尼，替张家说情，促成凤姐弄权。",
       detail="净虚在铁槛寺对凤姐说“张家有钱，只求府里一句话”，凤姐遂假托贾琏之名逼婚，得银三千两。这是凤姐干政敛财的开端。",
       tags=["馒头庵", "弄权铁槛寺"])
person("pl-zhinenger", "智能儿", family="other", role="僧道",
       summary="馒头庵小尼，与秦钟相恋，后私逃入城寻秦钟。",
       detail="智能儿自幼在庵中长大，与秦钟相好。秦钟病中她私逃进城探望，被秦业逐出，下落不明。",
       tags=["秦钟", "私逃"])
person("pl-madaopo", "马道婆", family="other", role="僧道",
       summary="贾府常往来的道婆，受赵姨娘之贿，以魇魔法害宝玉与凤姐。",
       detail="马道婆一面替贾母供奉“大光明普照菩萨”，一面收赵姨娘银钱与欠契，剪纸人作法。事发后被打入监牢。",
       tags=["魇魔法", "赵姨娘"])
person("pl-zhangdaoshi", "张道士", family="other", role="僧道",
       summary="清虚观道士，荣国公替身，贾母旧识，曾为宝玉提亲。",
       detail="张道士是当日荣国公的出家替身，清虚观打醮时他替宝玉说亲，引出“金麒麟”一段，暗伏湘云姻缘。",
       tags=["清虚观", "替身", "提亲"])

# ---------------- 镜像与友人 ----------------
person("pl-zhenbaoyu", "甄宝玉", family="other", role="外人",
       summary="金陵甄家公子，与贾宝玉同名同貌，性情却相反。",
       detail="甄宝玉是贾宝玉的镜像：同样衔玉而生，却好谈经济仕途。两人梦中相见，互称“臭男人”“禄蠹”，是全书“真假”主题的关键一笔。",
       tags=["镜像", "真假"])
person("pl-fengziying", "冯紫英", family="other", role="外人",
       summary="神武将军冯唐之子，宝玉友人，豪爽任侠。",
       detail="冯紫英与宝玉、薛蟠、蒋玉菡等交往，席间行令唱曲，是贵族公子社交圈的代表。",
       tags=["宝玉友人", "行令"])
person("pl-weiruolan", "卫若兰", family="other", role="外人",
       summary="世家公子，与宝玉交好，脂批暗示与史湘云有姻缘。",
       detail="卫若兰在书中仅于射圃一段露面。脂砚斋批语有“卫若兰射圃”与金麒麟伏笔，探佚者多认为他后娶湘云。",
       tags=["金麒麟", "湘云", "探佚"])

# ---------------- 清客 ----------------
for pid, name, note in [("pl-zhanguang", "詹光", "善画，帮闲凑趣"),
                        ("pl-shanpinren", "单聘仁", "清客，善逢迎"),
                        ("pl-buguxiu", "卜固修", "清客，帮闲")]:
    person(pid, name, family="other", role="清客",
           summary="贾政门下清客，陪谈陪游，姓名皆有谐音。",
           detail=note + "。“詹光”谐“沾光”，“单聘仁”谐“善骗人”，“卜固修”谐“不顾羞”，是作者对帮闲文人的讽刺。",
           tags=["清客", "谐音"])

# ---------------- 仆役与陪房 ----------------
person("pl-laimomo", "赖嬷嬷", family="rong", role="仆役",
       summary="贾府老仆，服侍过贾母一辈，孙子赖尚荣捐官。",
       detail="赖嬷嬷在贾母面前有座位，是“老家人”的代表。她教训孙子赖尚荣“你今年活了三十岁，虽然是人家的奴才，一落娘胎胞，主子恩典，放你出来……”",
       tags=["老仆", "赖家"])
person("pl-laishangrong", "赖尚荣", family="rong", role="仆役",
       summary="赖大之子，蒙贾府恩典放出，捐了州县官。",
       detail="赖尚荣是贾府豪奴子弟做官的样本：靠主子的关系脱籍捐官，也照见贾府的权势如何滋养依附者。",
       tags=["捐官", "脱籍"])
person("pl-wangshanbao", "王善保家的", family="rong", role="仆役",
       summary="邢夫人陪房，抄检大观园的挑唆者，司棋的外祖母。",
       detail="王善保家的因外孙女司棋被逐而怀恨，撺掇王夫人抄检，结果反查出自己外孙女的私情，当场出丑。",
       tags=["陪房", "抄检", "司棋外祖母"])
person("pl-zhourui", "周瑞家的", family="rong", role="仆役",
       summary="王夫人陪房，引刘姥姥进府，府中消息灵通的管事媳妇。",
       detail="周瑞家的是“送宫花”一回的引线人，借她的行走路线把各房人物关系一一带出。",
       tags=["陪房", "送宫花", "刘姥姥"])
person("pl-linzhixiao", "林之孝家的", family="rong", role="仆役",
       summary="荣府管事媳妇，小红之母，巡夜查岗颇有威势。",
       detail="林之孝家的掌管内务，抄检、查夜都由她随行。小红正是她女儿，却只能在怡红院做粗活。",
       tags=["管事", "小红之母"])
person("pl-mingyan", "茗烟", alias="焙茗", family="rong", role="小厮",
       summary="宝玉贴身小厮，机灵淘气，闹学堂、烧香、找书都少不了他。",
       detail="茗烟最得宝玉信任，敢替主子出头，也敢在书房里偷看闲书。宝玉祭金钏、访晴雯，都是他跟着。",
       tags=["小厮", "闹学堂"])
person("pl-ligui", "李贵", family="rong", role="小厮",
       summary="宝玉奶兄，宝玉的跟班头儿，老成持重。",
       detail="李贵在闹学堂后替宝玉挨贾政的骂，回话得体：“哥儿已经吓慌了，老爷也不用太紧。”是仆役中少见的老成人。",
       tags=["奶兄", "跟班"])
person("pl-xinger", "兴儿", family="rong", role="小厮",
       summary="贾琏的小厮，向尤二姐细说荣府诸人，口齿伶俐。",
       detail="兴儿一段“荣府人物论”极为精彩：说凤姐“嘴甜心苦，两面三刀”，说探春“玫瑰花”，是借小厮之口作人物小传。",
       tags=["小厮", "荣府人物论"])

# ---------------- 丫鬟补遗 ----------------
for pid, name, host, host_id, note in [
    ("pl-cuimo", "翠墨", "探春", "pl-tanchun", "秋爽斋丫鬟，随探春理家、应对抄检"),
    ("pl-cuilv", "翠缕", "史湘云", "pl-xiangyun", "湘云丫鬟，与主子论阴阳，天真有趣"),
    ("pl-xiuju", "绣橘", "贾迎春", "pl-yingchun", "迎春丫鬟，为主子争累丝金凤，比迎春更强硬"),
    ("pl-suyun", "素云", "李纨", "pl-livan", "稻香村丫鬟，行事稳当"),
    ("pl-biyue", "碧月", "李纨", "pl-livan", "稻香村丫鬟"),
    ("pl-hupo", "琥珀", "贾母", "pl-jiamu", "贾母房中丫鬟，传话理事"),
    ("pl-qiuwen", "秋纹", "贾宝玉", "pl-baoyu", "怡红院丫鬟，性急口快"),
    ("pl-bihen", "碧痕", "贾宝玉", "pl-baoyu", "怡红院丫鬟，曾服侍宝玉沐浴"),
    ("pl-qianxue", "茜雪", "贾宝玉", "pl-baoyu", "怡红院丫鬟，因枫露茶事被撵，是宝玉房中第一个被逐的"),
    ("pl-chunyan", "春燕", "贾宝玉", "pl-baoyu", "怡红院丫鬟，与母亲、姑妈的家庭纠纷写出底层处境"),
    ("pl-sier", "四儿", "贾宝玉", "pl-baoyu", "怡红院丫鬟，原名芸香，因说“同生日就是夫妻”被逐"),
    ("pl-zhuier", "坠儿", "贾宝玉", "pl-baoyu", "怡红院小丫鬟，偷虾须镯被晴雯撵出"),
]:
    person(pid, name, family="rong", role="丫鬟",
           summary=host + "房中丫鬟。" + note + "。",
           detail=note + "。她们的存在让大观园的日常有了层次，也让“千红一哭”的结局更具体。",
           tags=[host + "丫鬟"])

for pid, name, note in [("pl-wenguan", "文官", "十二官之首，贾母留下使唤"),
                        ("pl-ruiguan", "蕊官", "十二官之一，后归宝钗"),
                        ("pl-ouguan2", "菂官", "十二官之一，与藕官相好，早亡")]:
    person(pid, name, family="rong", role="丫鬟",
           summary="梨香院十二戏子之一。" + note + "。",
           detail=note + "。十二官被遣散后各寻归宿，是“风流云散”最具体的一次预演。",
           tags=["戏子", "十二官"])

# ---------------- 关系 ----------------
FAM = [
    ("pl-jiamu", "pl-jiashe", "母子"), ("pl-jiamu", "pl-jiazheng", "母子"),
    ("pl-jiamu", "pl-jiamin", "母女"), ("pl-jiamu", "pl-baoyu", "祖孙"),
    ("pl-jiamu", "pl-daiyu", "外祖母"), ("pl-jiamu", "pl-xiangyun", "姑祖母"),
    ("pl-jiamu", "pl-yuanyang", "主仆"), ("pl-jiamu", "pl-jialan", "曾祖母"),
    ("pl-jiashe", "pl-xingfuren", "夫妻"), ("pl-jiashe", "pl-jialian", "父子"),
    ("pl-jiashe", "pl-yingchun", "父女"), ("pl-xingfuren", "pl-yingchun", "嫡母"),
    ("pl-jiazheng", "pl-wangfuren", "夫妻"), ("pl-jiazheng", "pl-jiayuanchun", "父女"),
    ("pl-jiazheng", "pl-jiazhu", "父子"), ("pl-jiazheng", "pl-baoyu", "父子"),
    ("pl-jiazheng", "pl-tanchun", "父女"), ("pl-jiazheng", "pl-jiahuan", "父子"),
    ("pl-jiazheng", "pl-zhaoyiniang", "妾室"),
    ("pl-wangfuren", "pl-jiayuanchun", "母女"), ("pl-wangfuren", "pl-jiazhu", "母子"),
    ("pl-wangfuren", "pl-baoyu", "母子"), ("pl-wangfuren", "pl-jinchuan", "主仆"),
    ("pl-wangfuren", "pl-yuchuan", "主仆"),
    ("pl-jiazhu", "pl-livan", "夫妻"), ("pl-livan", "pl-jialan", "母子"),
    ("pl-jialian", "pl-wangxifeng", "夫妻"), ("pl-jialian", "pl-qiaojie", "父女"),
    ("pl-wangxifeng", "pl-qiaojie", "母女"), ("pl-jialian", "pl-pinger", "妾室"),
    ("pl-wangxifeng", "pl-pinger", "主仆"), ("pl-jialian", "pl-youerjie", "夫妻"),
    ("pl-jiajing", "pl-jiazhen", "父子"), ("pl-jiajing", "pl-xichun", "父女"),
    ("pl-jiazhen", "pl-youshi", "夫妻"), ("pl-jiazhen", "pl-jiarong", "父子"),
    ("pl-jiazhen", "pl-xichun", "兄妹"),
    ("pl-jiarong", "pl-qinkeqing", "夫妻"), ("pl-qinkeqing", "pl-qinzhong", "姐弟"),
    ("pl-qinye", "pl-qinkeqing", "养父女"), ("pl-qinye", "pl-qinzhong", "父子"),
    ("pl-linruhai", "pl-jiamin", "夫妻"), ("pl-jiamin", "pl-daiyu", "母女"),
    ("pl-linruhai", "pl-daiyu", "父女"),
    ("pl-xueyima", "pl-xuebaochai", "母女"), ("pl-xueyima", "pl-xuepan", "母子"),
    ("pl-xuepan", "pl-xuebaochai", "兄妹"), ("pl-xuepan", "pl-xiajingui", "夫妻"),
    ("pl-xuepan", "pl-xiangling", "妾室"), ("pl-xueke", "pl-xuebaoqin", "兄妹"),
    ("pl-xueke", "pl-xuepan", "堂兄弟"), ("pl-zhenshiyin", "pl-xiangling", "父女"),
    ("pl-yousanjie", "pl-youerjie", "姐妹"), ("pl-youshi", "pl-youerjie", "姐妹"),
    ("pl-yousanjie", "pl-liuxianglian", "未婚夫妻"),
    ("pl-wangziteng", "pl-wangfuren", "兄妹"), ("pl-wangziteng", "pl-wangxifeng", "叔侄"),
    ("pl-wangfuren", "pl-xueyima", "姐妹"), ("pl-wangfuren", "pl-wangxifeng", "姑侄"),
    ("pl-wangfuren", "pl-xuebaochai", "姨甥"),
    ("pl-liulaolao", "pl-baner", "祖孙"), ("pl-liulaolao", "pl-qiaojie", "恩人"),
    ("pl-liulaolao", "pl-wangfuren", "远亲"),
]
for a, b, l in FAM:
    rel(a, b, l)

LOVE = [
    ("pl-baoyu", "pl-daiyu", "知己"), ("pl-baoyu", "pl-xuebaochai", "夫妻"),
    ("pl-baoyu", "pl-xiangyun", "表亲"), ("pl-baoyu", "pl-qingwen", "主仆"),
    ("pl-baoyu", "pl-xiren", "主仆"), ("pl-baoyu", "pl-sheyue", "主仆"),
    ("pl-baoyu", "pl-qinzhong", "同窗"), ("pl-baoyu", "pl-jiangyuhan", "友人"),
    ("pl-baoyu", "pl-miaoyu", "诗友"), ("pl-baoyu", "pl-qinkeqing", "梦境引路人"),
    ("pl-baoyu", "pl-jiahuan", "兄弟"),
    ("pl-daiyu", "pl-ziyuan", "主仆"), ("pl-daiyu", "pl-xueyan", "主仆"),
    ("pl-daiyu", "pl-xiangling", "诗友"), ("pl-daiyu", "pl-livan", "诗社同人"),
    ("pl-xuebaochai", "pl-yinger", "主仆"), ("pl-xuebaochai", "pl-xiangling", "姑嫂"),
    ("pl-yingchun", "pl-siqi", "主仆"), ("pl-tanchun", "pl-shishu", "主仆"),
    ("pl-xichun", "pl-ruhua", "主仆"), ("pl-wangxifeng", "pl-xiaohong", "主仆"),
    ("pl-jiayuanchun", "pl-baoyu", "姐弟"), ("pl-jiayuanchun", "pl-jiazheng", "父女"),
    ("pl-livan", "pl-tanchun", "诗社同人"),
]
for a, b, l in LOVE:
    rel(a, b, l)

MISC = [
    ("pl-jiaoda", "pl-jiazhen", "老仆"), ("pl-laida", "pl-jiazheng", "大管家"),
    ("pl-jiayucun", "pl-daiyu", "塾师"), ("pl-jiayucun", "pl-zhenshiyin", "旧交"),
    ("pl-jiayucun", "pl-jiazheng", "攀附"),
    ("pl-yizengyidao", "pl-baoyu", "点化"), ("pl-yizengyidao", "pl-daiyu", "点化"),
    ("pl-yizengyidao", "pl-zhenshiyin", "度化"),
    ("pl-jinghuan", "pl-baoyu", "引游幻境"), ("pl-jinghuan", "pl-qinkeqing", "姐妹"),
    ("pl-kongkong", "pl-yizengyidao", "抄录"),
    ("pl-xiren", "pl-jiangyuhan", "夫妻"),
    ("pl-miaoyu", "pl-xingxiuyan", "旧交"), ("pl-miaoyu", "pl-xichun", "方外之交"),
    ("pl-xingxiuyan", "pl-xueke", "未婚夫妻"),
]
for a, b, l in MISC:
    rel(a, b, l)

# 诗社、抄检等群体关系
for a in ["pl-daiyu", "pl-xuebaochai", "pl-tanchun", "pl-xiangyun", "pl-livan", "pl-baoyu"]:
    for b in ["pl-daiyu", "pl-xuebaochai", "pl-tanchun", "pl-xiangyun", "pl-livan", "pl-baoyu"]:
        if a < b:
            rel(a, b, "诗社同人")


# ---------------- 补充关系 ----------------
EXTRA = [
    # 族中旁支
    ("pl-jiadairu", "pl-jiarui", "祖孙"),
    ("pl-jiadairu", "pl-jiazheng", "族中长辈"),
    ("pl-jiarui", "pl-wangxifeng", "相思"),
    ("pl-jiaqiang", "pl-jiazhen", "抚养"),
    ("pl-jiaqiang", "pl-lingguan", "情人"),
    ("pl-jiayun", "pl-xiaohong", "情人"),
    ("pl-jiayun", "pl-jialian", "宗族"),
    ("pl-jiayun", "pl-wangxifeng", "求差事"),
    ("pl-jiaqin", "pl-jiazhen", "宗族"),
    ("pl-jiaqin", "pl-wangxifeng", "求差事"),
    # 妾室与姻亲
    ("pl-zhouyiniang", "pl-jiazheng", "妾室"),
    ("pl-zhouyiniang", "pl-zhaoyiniang", "同侪"),
    ("pl-hushi", "pl-jiarong", "夫妻"),
    ("pl-sunshaozu", "pl-yingchun", "夫妻"),
    ("pl-sunshaozu", "pl-jiashe", "翁婿"),
    ("pl-youlaniang", "pl-youshi", "继母女"),
    ("pl-youlaniang", "pl-youerjie", "母女"),
    ("pl-youlaniang", "pl-yousanjie", "母女"),
    ("pl-liwen", "pl-livan", "堂姐妹"),
    ("pl-liqi", "pl-livan", "堂姐妹"),
    ("pl-liwen", "pl-liqi", "姐妹"),
    ("pl-liqi", "pl-zhenbaoyu", "夫妻"),
    # 僧道
    ("pl-zhinenger", "pl-qinzhong", "情人"),
    ("pl-zhinenger", "pl-jingxu", "师徒"),
    ("pl-jingxu", "pl-wangxifeng", "请托"),
    ("pl-madaopo", "pl-zhaoyiniang", "串通"),
    ("pl-madaopo", "pl-jiamu", "供奉"),
    ("pl-zhangdaoshi", "pl-jiamu", "旧识"),
    ("pl-zhangdaoshi", "pl-baoyu", "提亲"),
    # 镜像与友人
    ("pl-zhenbaoyu", "pl-baoyu", "镜像"),
    ("pl-fengziying", "pl-baoyu", "友人"),
    ("pl-fengziying", "pl-xuepan", "友人"),
    ("pl-weiruolan", "pl-baoyu", "友人"),
    ("pl-weiruolan", "pl-xiangyun", "夫妻"),
    # 清客
    ("pl-zhanguang", "pl-jiazheng", "清客"),
    ("pl-shanpinren", "pl-jiazheng", "清客"),
    ("pl-buguxiu", "pl-jiazheng", "清客"),
    # 仆役与陪房
    ("pl-laimomo", "pl-jiamu", "老仆"),
    ("pl-laishangrong", "pl-laimomo", "祖孙"),
    ("pl-laishangrong", "pl-jiazheng", "主仆"),
    ("pl-wangshanbao", "pl-xingfuren", "陪房"),
    ("pl-wangshanbao", "pl-siqi", "外祖母"),
    ("pl-wangshanbao", "pl-tanchun", "抄检"),
    ("pl-zhourui", "pl-wangfuren", "陪房"),
    ("pl-zhourui", "pl-liulaolao", "引荐"),
    ("pl-linzhixiao", "pl-xiaohong", "母女"),
    ("pl-linzhixiao", "pl-wangxifeng", "主仆"),
    ("pl-mingyan", "pl-baoyu", "小厮"),
    ("pl-ligui", "pl-baoyu", "奶兄"),
    ("pl-xinger", "pl-jialian", "小厮"),
    ("pl-xinger", "pl-youerjie", "传话"),
]
for a, b, l in EXTRA:
    rel(a, b, l)

# 丫鬟与本房主子
HOSTS = {
    "pl-cuimo": "pl-tanchun", "pl-cuilv": "pl-xiangyun", "pl-xiuju": "pl-yingchun",
    "pl-suyun": "pl-livan", "pl-biyue": "pl-livan", "pl-hupo": "pl-jiamu",
    "pl-qiuwen": "pl-baoyu", "pl-bihen": "pl-baoyu", "pl-qianxue": "pl-baoyu",
    "pl-chunyan": "pl-baoyu", "pl-sier": "pl-baoyu", "pl-zhuier": "pl-baoyu",
}
for maid, host in HOSTS.items():
    rel(maid, host, "主仆")
    # 只有怡红院的丫鬟才与袭人、晴雯、麝月同房
    if host == "pl-baoyu":
        for peer in ["pl-xiren", "pl-qingwen", "pl-sheyue"]:
            rel(maid, peer, "同房")

# 十二官
rel("pl-wenguan", "pl-jiamu", "主仆")
rel("pl-wenguan", "pl-fangguan", "同班")
rel("pl-ruiguan", "pl-xuebaochai", "主仆")
rel("pl-ruiguan", "pl-fangguan", "同班")
rel("pl-ouguan2", "pl-ouguan", "情人")
rel("pl-ouguan2", "pl-fangguan", "同班")

# 丫鬟间的私交与冲突
rel("pl-zhuier", "pl-xiaohong", "私交")
rel("pl-zhuier", "pl-qingwen", "被撵")
rel("pl-chunyan", "pl-yinger", "私交")
rel("pl-pinger", "pl-xinger", "同僚")
rel("pl-yuanyang", "pl-hupo", "同房")
rel("pl-jinchuan", "pl-yuchuan", "姐妹")

# 事件补挂人物
EVENT_EXTRA = {
    "ev-yuanyang-ju": ["pl-xingfuren"],
    "ev-chaojia": ["pl-jiaqiang", "pl-jiaqin"],
    "ev-liulaolao": ["pl-zhourui", "pl-pinger"],
    "ev-shishe": ["pl-liwen", "pl-liqi"],
    "ev-daiyu-jin": ["pl-xingfuren"],
}
for eid, pids in EVENT_EXTRA.items():
    for pid in pids:
        R.append({"a": eid, "b": pid, "label": "出场"})

# ---------------- 判词 ----------------
FATE = [
    ("fate-baochai-daiyu", "林黛玉·薛宝钗", "【正册】可叹停机德，堪怜咏絮才。玉带林中挂，金簪雪里埋。",
     "停机德指宝钗的妇德，咏絮才指黛玉的才情。“玉带林中挂”倒读“林黛玉”，“金簪雪里埋”谐“薛宝钗”，二人命运合写，一个悬梁、一个冷落。",
     ["pl-daiyu", "pl-xuebaochai"]),
    ("fate-yuanchun", "贾元春", "【正册】二十年来辨是非，榴花开处照宫闱。三春争及初春景，虎兕相逢大梦归。",
     "“三春”指迎、探、惜三春，“初春”即元春。虎兕相逢喻宫廷倾轧，元春之死使贾府失去最大政治靠山。",
     ["pl-jiayuanchun"]),
    ("fate-tanchun", "贾探春", "【正册】才自精明志自高，生于末世运偏消。清明涕送江边望，千里东风一梦遥。",
     "才志俱高而生逢末世，远嫁海疆，一去不返。清明江边送别，是全书的伤心画面之一。",
     ["pl-tanchun"]),
    ("fate-xiangyun", "史湘云", "【正册】富贵又何为，襁褓之间父母违。展眼吊斜晖，湘江水逝楚云飞。",
     "自幼父母双亡，虽出身侯门而无依靠。“湘江”“楚云”暗嵌其名，结局飘零。",
     ["pl-xiangyun"]),
    ("fate-miaoyu", "妙玉", "【正册】欲洁何曾洁，云空未必空。可怜金玉质，终陷淖泥中。",
     "写其“洁”与“空”的悖论：越是自命清高，越逃不过沦落。续书以被盗、被劫作结。",
     ["pl-miaoyu"]),
    ("fate-yingchun", "贾迎春", "【正册】子系中山狼，得志便猖狂。金闺花柳质，一载赴黄粱。",
     "“子系”合为“孙”，指孙绍祖。迎春嫁后一年即被折磨而死。",
     ["pl-yingchun"]),
    ("fate-xichun", "贾惜春", "【正册】勘破三春景不长，缁衣顿改昔年妆。可怜绣户侯门女，独卧青灯古佛旁。",
     "看破三位姐姐的命运，遂出家为尼。判词直写结局，是十二钗中最先“了悟”的一个。",
     ["pl-xichun"]),
    ("fate-xifeng", "王熙凤", "【正册】凡鸟偏从末世来，都知爱慕此生才。一从二令三人木，哭向金陵事更哀。",
     "“凡鸟”合为“凤”，“人木”合为“休”，暗示被休弃。机关算尽，终至哭向金陵。",
     ["pl-wangxifeng"]),
    ("fate-qiaojie", "巧姐", "【正册】势败休云贵，家亡莫论亲。偶因济刘氏，巧得遇恩人。",
     "家败后被亲人算计，因母亲当年接济刘姥姥而得救，是十二钗中唯一“逢凶化吉”者。",
     ["pl-qiaojie", "pl-liulaolao"]),
    ("fate-livan", "李纨", "【正册】桃李春风结子完，到头谁似一盆兰。如冰水好空相妒，枉与他人作笑谈。",
     "“结子完”谐“李纨”，“一盆兰”指贾兰。守节抚孤终得诰命，却已青春耗尽。",
     ["pl-livan", "pl-jialan"]),
    ("fate-qinkeqing", "秦可卿", "【正册】情天情海幻情身，情既相逢必主淫。漫言不肖皆荣出，造衅开端实在宁。",
     "把宁国府的败亡归因于“情”与“淫”，直指贾珍一辈。秦可卿之死是全书第一大关节。",
     ["pl-qinkeqing"]),
    ("fate-xiangling", "香菱", "【副册】根并荷花一茎香，平生遭际实堪伤。自从两地生孤木，致使香魂返故乡。",
     "“两地生孤木”合成“桂”，指夏金桂。香菱受其折磨而死，应“香魂返故乡”。",
     ["pl-xiangling"]),
    ("fate-qingwen", "晴雯", "【又副册】霁月难逢，彩云易散。心比天高，身为下贱。风流灵巧招人怨。寿夭多因诽谤生，多情公子空牵念。",
     "“霁月”谐“晴”，“彩云”谐“雯”。晴雯因貌美性傲招谤被逐，含冤而死。",
     ["pl-qingwen"]),
    ("fate-xiren", "袭人", "【又副册】枉自温柔和顺，空云似桂如兰。堪羡优伶有福，谁知公子无缘。",
     "“似桂如兰”暗合“花气袭人”。她最终嫁与优伶蒋玉菡，与宝玉无缘。",
     ["pl-xiren", "pl-jiangyuhan"]),
]

# ---------------- 诗词 ----------------
POETRY = [
    ("poem-haoliaoge", "《好了歌》", "跛足道人",
     "世人都晓神仙好，惟有功名忘不了！古今将相在何方？荒冢一堆草没了。\n"
     "世人都晓神仙好，只有金银忘不了！终朝只恨聚无多，及到多时眼闭了。\n"
     "世人都晓神仙好，只有姣妻忘不了！君生日日说恩情，君死又随人去了。\n"
     "世人都晓神仙好，只有儿孙忘不了！痴心父母古来多，孝顺儿孙谁见了？",
     "全书的总纲。甄士隐听罢顿悟，作《好了歌注》，“好”即是“了”，了便是好。",
     ["pl-zhenshiyin", "pl-yizengyidao"]),
    ("poem-wangningmei", "《枉凝眉》", "曹雪芹",
     "一个是阆苑仙葩，一个是美玉无瑕。若说没奇缘，今生偏又遇着他；若说有奇缘，如何心事终虚化？\n"
     "一个枉自嗟呀，一个空劳牵挂。一个是水中月，一个是镜中花。想眼中能有多少泪珠儿，怎经得秋流到冬尽，春流到夏！",
     "《红楼梦》十二支曲之一，写宝黛之情终成虚化。“水中月、镜中花”是全书最痛的比喻。",
     ["pl-baoyu", "pl-daiyu"]),
    ("poem-zanghua", "《葬花吟》（节选）", "林黛玉",
     "花谢花飞花满天，红消香断有谁怜？游丝软系飘春榭，落絮轻沾扑绣帘。\n"
     "……\n"
     "侬今葬花人笑痴，他年葬侬知是谁？试看春残花渐落，便是红颜老死时。一朝春尽红颜老，花落人亡两不知！",
     "黛玉葬花时所吟，以花自况：今日葬花，他年谁葬我？是全书“千红一哭，万艳同悲”的集中表达。",
     ["pl-daiyu", "pl-baoyu"]),
    ("poem-qiuchuang", "《秋窗风雨夕》（节选）", "林黛玉",
     "秋花惨淡秋草黄，耿耿秋灯秋夜长。已觉秋窗秋不尽，那堪风雨助凄凉！\n"
     "……\n"
     "不知风雨几时休，已教泪洒窗纱湿。",
     "黛玉病中拟《春江花月夜》之格而作，句句是秋，字字是泪。",
     ["pl-daiyu"]),
    ("poem-taohua", "《桃花行》（节选）", "林黛玉",
     "桃花帘外东风软，桃花帘内晨妆懒。帘外桃花帘内人，人与桃花隔不远。\n"
     "……\n"
     "一声杜宇春归尽，寂寞帘栊空月痕。",
     "以桃花起兴，写青春易逝。宝玉读罢“并不称赞，却滚下泪来”，唯有他懂。",
     ["pl-daiyu", "pl-baoyu"]),
    ("poem-linjiangxian", "《临江仙·柳絮》", "薛宝钗",
     "白玉堂前春解舞，东风卷得均匀。蜂围蝶阵乱纷纷。几曾随逝水？岂必委芳尘？\n"
     "万缕千丝终不改，任他随聚随分。韶华休笑本无根。好风凭借力，送我上青云。",
     "同一阕柳絮词，黛玉写“飘泊亦如人命薄”，宝钗写“好风凭借力”，两种人生态度判然。",
     ["pl-xuebaochai", "pl-daiyu"]),
    ("poem-wenju", "《问菊》", "林黛玉",
     "欲讯秋情众莫知，喃喃负手叩东篱。孤标傲世偕谁隐，一样花开为底迟？\n"
     "圃露庭霜何寂寞，鸿归蛩病可相思？休言举世无谈者，解语何妨话片时。",
     "菊花诗社之作。“孤标傲世偕谁隐”是黛玉的自画像。",
     ["pl-daiyu", "pl-tanchun"]),
    ("poem-haishang", "《咏白海棠》（节选）", "薛宝钗",
     "珍重芳姿昼掩门，自携手瓮灌苔盆。胭脂洗出秋阶影，冰雪招来露砌魂。\n"
     "淡极始知花更艳，愁多焉得玉无痕。欲偿白帝凭清洁，不语婷婷日又昏。",
     "海棠诗社开社之作，宝钗此首被李纨评为第一，端庄含蓄，正合其人。",
     ["pl-xuebaochai", "pl-livan"]),
]

# ---------------- 地点 ----------------
PLACE = [
    ("place-daguanyuan", "大观园", "为元春省亲所建，园中十二处院落，是全书主要舞台。",
     "大观园由会芳园旧址扩建成，规模三里半，亭台楼阁俱全。元春题名“大观”，命姐妹们入园居住。它既是青春乐园，也是《红楼梦》由盛转衰的容器。", ["pl-jiayuanchun", "pl-baoyu"]),
    ("place-yihongyuan", "怡红院", "宝玉居所，院中蕉棠两植，富丽而热闹。",
     "怡红院是园中最热闹也最混乱的地方：丫鬟成群、嬉笑打闹，也是宝玉“情不情”的舞台。", ["pl-baoyu", "pl-xiren", "pl-qingwen"]),
    ("place-xiaoxiangguan", "潇湘馆", "黛玉居所，翠竹掩映，清幽寂静。",
     "潇湘馆以竹为胜，凤尾森森、龙吟细细，正合黛玉之清冷孤高。", ["pl-daiyu", "pl-ziyuan"]),
    ("place-hengwuyuan", "蘅芜苑", "宝钗居所，无花有藤，素净冷清。",
     "蘅芜苑“一株花木也无”，只有香草藤蔓，被贾母评为“太素净”，正是宝钗之“冷”的写照。", ["pl-xuebaochai", "pl-yinger"]),
    ("place-qiushuangzhai", "秋爽斋", "探春居所，阔朗通敞，陈设大气。",
     "秋爽斋三间屋子不隔断，案上大鼎、大观窑大盘，可见探春的阔朗与气度。", ["pl-tanchun", "pl-shishu"]),
    ("place-daoxiangcun", "稻香村", "李纨居所，仿农家村舍，竹篱茅舍。",
     "稻香村是人工造的“田舍”，宝玉曾批评其“分明见得一派人工”。李纨在此守节教子。", ["pl-livan", "pl-jialan"]),
    ("place-nuanxiangwu", "暖香坞", "惜春居所，也是她作画的画房。",
     "暖香坞中备着画具，惜春奉命画大观园全景，这幅“大观园图”最终没有画完。", ["pl-xichun", "pl-ruhua"]),
    ("place-longcuian", "栊翠庵", "园中尼庵，妙玉修行之所，有红梅数株。",
     "栊翠庵品茶一回，妙玉以成窑五彩小盖钟待客，又以梅花赠宝玉，写出她的清高与凡心。", ["pl-miaoyu", "pl-baoyu"]),
    ("place-zilingzhou", "紫菱洲", "迎春居所，临水而建，蓼花苇叶，冷落寂寥。",
     "迎春出嫁后，宝玉作《紫菱洲歌》：“池塘一夜秋风冷，吹散芰荷红玉影。”", ["pl-yingchun", "pl-siqi"]),
    ("place-rongguofu", "荣国府", "贾政、贾赦两支所居，贾母、王夫人与凤姐都住在此。",
     "荣国府是全书权力与经济中心，凤姐在此当家，抄家也从这里开始。", ["pl-jiamu", "pl-jiazheng", "pl-wangxifeng"]),
    ("place-ningguofu", "宁国府", "贾敬、贾珍一支所居，与荣国府一墙之隔。",
     "宁国府藏污纳垢，焦大醉骂、秦可卿之丧都在此。判词说“造衅开端实在宁”。", ["pl-jiazhen", "pl-qinkeqing"]),
    ("place-tianxianglou", "天香楼", "宁国府内楼阁，秦可卿事的关键地点。",
     "脂砚斋批语有“秦可卿淫丧天香楼”之说，今本已删改，只留下重重疑云。", ["pl-qinkeqing", "pl-jiazhen"]),
    ("place-taixu", "太虚幻境", "警幻仙姑所主之境，藏金陵十二钗册子与《红楼梦》十二支曲。",
     "宝玉梦游太虚幻境，是全书的总纲：先看结局，再历红尘，故“悲凉之雾，遍被华林”。", ["pl-jinghuan", "pl-baoyu"]),
    ("place-tiekansi", "铁槛寺", "贾府家庙，秦可卿停灵之处，凤姐弄权于此。",
     "凤姐在铁槛寺受老尼之托，拆散张金哥姻缘，坐享三千两，是她“弄权”的开端。", ["pl-wangxifeng", "pl-qinkeqing"]),
    ("place-hulumiao", "葫芦庙", "姑苏城外小庙，甄士隐家毗邻，一场大火烧尽。",
     "葫芦庙炸供失火，延烧甄家，是全书第一场“火”，也是“真事隐”的起点。", ["pl-zhenshiyin", "pl-jiayucun"]),
]
for i, (pid, name, summary, detail, rl) in enumerate(PLACE):
    P.append(dict(id=pid, cat="place", type="园中院落" if name not in ("荣国府", "宁国府", "太虚幻境", "葫芦庙", "铁槛寺") else "府邸/境", name=name,
                  summary=summary, detail=detail, tags=[]))
    for x in rl:
        R.append({"a": pid, "b": x, "label": "所在"})

# ---------------- 事件 ----------------
EVENT = [
    ("ev-daiyu-jin", "黛玉进贾府", "第三回", "黛玉丧母后入京，初见贾母、凤姐、宝玉。",
     "黛玉“步步留心，时时在意”，王熙凤一句“天下真有这样标致的人物”，宝玉一句“这个妹妹我曾见过的”，把三个人物一笔写定。"),
    ("ev-baodai-chujian", "宝黛初会", "第三回", "宝玉见黛玉，摔玉发狂。",
     "宝玉问黛玉“可有玉没有”，听说没有，便摔玉骂道“什么罕物，连人之高低不择”，从此“木石前盟”落地。"),
    ("ev-ningguo-sang", "秦可卿之丧", "第十三回", "秦可卿病逝，贾珍大办丧事，凤姐协理宁国府。",
     "丧事排场逾制，贾珍“尽我所有”；凤姐受命协理，一出手便见治家之才。"),
    ("ev-yuanfei-shengqin", "元妃省亲", "第十八回", "元春封妃后归省，大观园极盛。",
     "省亲是贾府最辉煌的一天，也是衰败的起点。“当日既送我到那不得见人的去处”一句，写尽荣华的代价。"),
    ("ev-baoyu-aida", "宝玉挨打", "第三十三回", "贾政因宝玉结交优伶、逼死金钏而痛打。",
     "贾政下死手，王夫人哭贾珠，贾母赶来痛斥——“打死宝玉，不如先打死我”。此后宝玉在府中的地位与精神都变了。"),
    ("ev-daiyu-zanghua", "黛玉葬花", "第二十七回", "黛玉埋花作《葬花吟》，宝玉闻之恸倒。",
     "葬花是全书最著名的意象：以花喻人，以葬花写自悼。"),
    ("ev-chaojian", "抄检大观园", "第七十四回", "王夫人命人搜查各院，晴雯、司棋、入画等被逐。",
     "抄检是家族内部信任的崩塌，也是大观园由盛转衰的分水岭。探春说“自杀自灭起来，才能一败涂地”。"),
    ("ev-qingwen-si", "晴雯之死", "第七十七至七十八回", "晴雯被逐后病死，宝玉作《芙蓉女儿诔》。",
     "晴雯“心比天高，身为下贱”，被以“狐狸精”之名逐出，死前与宝玉互换贴身衣物。诔文表面祭晴雯，实则悼黛玉。"),
    ("ev-daiyu-fengao", "黛玉焚稿", "第九十七回", "宝玉娶宝钗之夜，黛玉焚烧诗稿与诗帕，含恨而亡。",
     "“焚稿断痴情”是全书最惨烈的一幕：她烧掉的不是纸，是自己的一生。"),
    ("ev-baoyu-quqin", "宝玉娶亲", "第九十七回", "贾府用“掉包计”，宝玉误以为娶的是黛玉。",
     "凤姐设谋，宝玉娶宝钗。洞房揭盖头后，宝玉“更觉昏聩”，从此神志恍惚。"),
    ("ev-chaojia", "贾府抄家", "第一百五回", "锦衣军查抄宁荣二府，贾赦、贾珍获罪，家产籍没。",
     "抄家是全书的大结局：爵位、财富、体面一夕尽失，树倒猢狲散。"),
    ("ev-yuanyang-ju", "鸳鸯拒婚", "第四十六回", "贾赦欲娶鸳鸯为妾，鸳鸯当众铰发立誓。",
     "鸳鸯说“就是老太太逼着我，我一刀抹死了，也不能从命”，是全书最刚烈的一次反抗。"),
    ("ev-yousanjie", "尤三姐自刎", "第六十六回", "柳湘莲退婚，尤三姐以鸳鸯剑自刎明志。",
     "“还你的剑！”——一剑两命，柳湘莲随后截发出家。"),
    ("ev-erjie", "尤二姐吞金", "第六十九回", "凤姐设计逼死尤二姐。",
     "凤姐假意接她入府，暗中挑拨秋桐、克扣饮食，二姐不堪折磨吞金自逝。凤姐之“毒”在此写到极处。"),
    ("ev-liulaolao", "刘姥姥进大观园", "第三十九至四十一回", "刘姥姥三进荣国府，闹出许多笑话。",
     "借乡下人的眼睛写豪门的奢侈：一两银子一个的鸽子蛋、茄子鲞、妙玉的成窑杯。笑过之后是刺。"),
    ("ev-shishe", "海棠诗社", "第三十七回", "探春发起诗社，众人取号咏白海棠。",
     "诗社是大观园青春的高峰：黛玉的“偷来梨蕊三分白”、宝钗的“淡极始知花更艳”，都是各自人格的投影。"),
    ("ev-lianju", "芦雪庵联句", "第五十回", "雪中烤鹿肉、联句咏雪，湘云独占鳌头。",
     "“脂粉香娃割腥啖膻”，是全书最热闹的一场雪，也是最短暂的一次团圆。"),
    ("ev-chujia", "宝玉出家", "第一百二十回", "宝玉中举后随一僧一道而去，贾政雪中见其拜别。",
     "“我所居兮，青埂之峰；我所游兮，鸿蒙太空。”通灵宝玉归位，一场大梦收场。"),
]
EVENT_CAST = {
    "ev-daiyu-jin": ["pl-daiyu", "pl-jiamu", "pl-wangxifeng", "pl-baoyu", "pl-jiazheng", "pl-wangfuren"],
    "ev-baodai-chujian": ["pl-baoyu", "pl-daiyu", "pl-jiamu"],
    "ev-ningguo-sang": ["pl-qinkeqing", "pl-jiazhen", "pl-wangxifeng", "pl-jiarong", "pl-youshi"],
    "ev-yuanfei-shengqin": ["pl-jiayuanchun", "pl-jiazheng", "pl-wangfuren", "pl-baoyu", "pl-jiamu"],
    "ev-baoyu-aida": ["pl-baoyu", "pl-jiazheng", "pl-wangfuren", "pl-jiamu", "pl-jinchuan"],
    "ev-daiyu-zanghua": ["pl-daiyu", "pl-baoyu"],
    "ev-chaojian": ["pl-wangfuren", "pl-wangxifeng", "pl-qingwen", "pl-siqi", "pl-ruhua", "pl-tanchun", "pl-xichun"],
    "ev-qingwen-si": ["pl-qingwen", "pl-baoyu", "pl-wangfuren", "pl-xiren"],
    "ev-daiyu-fengao": ["pl-daiyu", "pl-ziyuan", "pl-baoyu", "pl-xuebaochai"],
    "ev-baoyu-quqin": ["pl-baoyu", "pl-xuebaochai", "pl-wangxifeng", "pl-jiamu", "pl-daiyu"],
    "ev-chaojia": ["pl-jiazheng", "pl-jiashe", "pl-jiazhen", "pl-jiamu", "pl-wangxifeng"],
    "ev-yuanyang-ju": ["pl-yuanyang", "pl-jiashe", "pl-jiamu", "pl-xingfuren"],
    "ev-yousanjie": ["pl-yousanjie", "pl-liuxianglian", "pl-youshi", "pl-jiazhen"],
    "ev-erjie": ["pl-youerjie", "pl-wangxifeng", "pl-jialian", "pl-pinger"],
    "ev-liulaolao": ["pl-liulaolao", "pl-baner", "pl-jiamu", "pl-wangxifeng", "pl-daiyu", "pl-xuebaochai"],
    "ev-shishe": ["pl-tanchun", "pl-daiyu", "pl-xuebaochai", "pl-xiangyun", "pl-livan", "pl-baoyu"],
    "ev-lianju": ["pl-xiangyun", "pl-baoyu", "pl-daiyu", "pl-xuebaochai", "pl-tanchun", "pl-livan"],
    "ev-chujia": ["pl-baoyu", "pl-jiazheng", "pl-xuebaochai", "pl-yizengyidao"],
}

CN = {"一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9}


def cn2int(text):
    """把「第三十三回」「第一百五回」「第七十七至七十八回」转成回数。"""
    t = re.sub(r"[^一二三四五六七八九十百0-9]", "", str(text).split("至")[0])
    if not t:
        return 0
    if t.isdigit():
        return int(t)
    section, num = 0, 0
    for ch in t:
        if ch in CN:
            num = CN[ch]
        elif ch == "十":
            section += (num or 1) * 10
            num = 0
        elif ch == "百":
            section += (num or 1) * 100
            num = 0
    return section + num


for i, (eid, name, where, summary, detail) in enumerate(EVENT):
    P.append(dict(id=eid, cat="event", type="情节", name=name, alias=where,
                  seq=cn2int(where) or (i + 1),
                  summary=summary, detail=detail, tags=[]))
    for pid in EVENT_CAST.get(eid, []):
        R.append({"a": eid, "b": pid, "label": "出场"})

# ---------------- 回目 ----------------
CHAPTER = [
    (1, "甄士隐梦幻识通灵　贾雨村风尘怀闺秀"),
    (3, "贾雨村夤缘复旧职　林黛玉抛父进京都"),
    (5, "游幻境指迷十二钗　饮仙醪曲演红楼梦"),
    (8, "比通灵金莺微露意　探宝钗黛玉半含酸"),
    (13, "秦可卿死封龙禁尉　王熙凤协理宁国府"),
    (27, "滴翠亭杨妃戏彩蝶　埋香冢飞燕泣残红"),
    (34, "情中情因情感妹妹　错里错以错劝哥哥"),
    (74, "惑奸谗抄检大观园　矢孤介杜绝宁国府"),
    (97, "林黛玉焚稿断痴情　薛宝钗出闺成大礼"),
    (120, "甄士隐详说太虚情　贾雨村归结红楼梦"),
]
for n, t in CHAPTER:
    P.append(dict(id="ch-%d" % n, cat="chapter", type="回目", name="第%d回" % n, alias=t, seq=n,
                  summary=t, detail="", tags=[]))

# ---------------- 统计数据面板 ----------------
PANELS = [
    {"title": "人物身份分布", "desc": "按身份分组统计（主子、丫鬟、亲戚、僧道等）。", "kind": "bars",
     "rows": [{"label": "主子", "value": 26}, {"label": "丫鬟", "value": 20}, {"label": "亲戚", "value": 10},
              {"label": "妾室", "value": 3}, {"label": "仆役", "value": 2}, {"label": "僧道", "value": 4},
              {"label": "外人", "value": 7}]},
    {"title": "家族人物数", "desc": "按家族归属统计，含外姓亲戚。", "kind": "bars",
     "rows": [{"label": "荣国府", "value": 26}, {"label": "宁国府", "value": 8}, {"label": "薛家", "value": 7},
              {"label": "林家", "value": 3}, {"label": "史家", "value": 1}, {"label": "王家", "value": 1},
              {"label": "方外与外人", "value": 19}]},
    {"title": "十二钗结局", "desc": "正册十二人 + 副册、又副册代表，按通行本结局归纳。", "kind": "table",
     "cols": ["人物", "册次", "结局"],
     "rows": [["林黛玉", "正册", "焚稿断痴情，泪尽而亡"],
              ["薛宝钗", "正册", "嫁宝玉，宝玉出家后独守"],
              ["贾元春", "正册", "宫中薨逝，贾府失靠山"],
              ["贾探春", "正册", "远嫁海疆"],
              ["史湘云", "正册", "夫死守寡，飘零"],
              ["妙玉", "正册", "被劫，沦落风尘"],
              ["贾迎春", "正册", "嫁孙绍祖，一年而亡"],
              ["贾惜春", "正册", "出家为尼"],
              ["王熙凤", "正册", "事败被休，哭向金陵"],
              ["巧姐", "正册", "得刘姥姥搭救，嫁农家"],
              ["李纨", "正册", "贾兰中举，诰命加身而青春已尽"],
              ["秦可卿", "正册", "淫丧天香楼（一说病亡）"],
              ["香菱", "副册", "受夏金桂折磨而死"],
              ["晴雯", "又副册", "被逐，含冤病死"],
              ["袭人", "又副册", "嫁蒋玉菡"]]},
]

# ---------------- 谱系（世代树） ----------------
# (id, 显示名, 父, 配偶, 世代, 家族)
GENEALOGY = [
    # 贾府：宁国府一脉
    ("pl-jiayan", "贾演\n宁国公", None, None, 1, "ning"),
    ("pl-jiadaihua", "贾代化", "pl-jiayan", None, 2, "ning"),
    ("pl-jiafu", "贾敷", "pl-jiadaihua", None, 3, "ning"),
    ("pl-jiajing", "贾敬", "pl-jiadaihua", None, 3, "ning"),
    ("pl-jiazhen", "贾珍", "pl-jiajing", "pl-youshi", 4, "ning"),
    ("pl-xichun", "贾惜春", "pl-jiajing", None, 4, "ning"),
    ("pl-jiarong", "贾蓉", "pl-jiazhen", "pl-hushi", 5, "ning"),
    # 宁府旁支：代字辈另出，不强行接世系
    ("pl-jiadairu", "贾代儒", None, None, 2, "ning"),
    ("pl-jiarui", "贾瑞", "pl-jiadairu", None, 3, "ning"),
    ("pl-jiaqiang", "贾蔷", None, None, 4, "ning"),
    # 贾府：荣国府一脉
    ("pl-jiayuan", "贾源\n荣国公", None, None, 1, "rong"),
    ("pl-jiadaishan", "贾代善", "pl-jiayuan", "pl-jiamu", 2, "rong"),
    ("pl-jiashe", "贾赦", "pl-jiadaishan", "pl-xingfuren", 3, "rong"),
    ("pl-jiazheng", "贾政", "pl-jiadaishan", "pl-wangfuren", 3, "rong"),
    ("pl-jiamin", "贾敏", "pl-jiadaishan", "pl-linruhai", 3, "rong"),
    ("pl-jialian", "贾琏", "pl-jiashe", "pl-wangxifeng", 4, "rong"),
    ("pl-yingchun", "贾迎春", "pl-jiashe", "pl-sunshaozu", 4, "rong"),
    ("pl-jiayuanchun", "贾元春", "pl-jiazheng", None, 4, "rong"),
    ("pl-jiazhu", "贾珠", "pl-jiazheng", "pl-livan", 4, "rong"),
    ("pl-baoyu", "贾宝玉", "pl-jiazheng", "pl-xuebaochai", 4, "rong"),
    ("pl-tanchun", "贾探春", "pl-jiazheng", None, 4, "rong"),
    ("pl-jiahuan", "贾环", "pl-jiazheng", None, 4, "rong"),
    ("pl-daiyu", "林黛玉", "pl-jiamin", None, 4, "rong"),
    ("pl-qiaojie", "巧姐", "pl-jialian", None, 5, "rong"),
    ("pl-jialan", "贾兰", "pl-jiazhu", None, 5, "rong"),
    ("pl-jiacong", "贾琮", "pl-jiashe", None, 4, "rong"),
    # 荣府旁支：世系失考，单列
    ("pl-jiayun", "贾芸", None, None, 4, "rong"),
    ("pl-jiaqin", "贾芹", None, None, 4, "rong"),
    # 林家：贾敏为林如海妻，不在林家图中重复为女
    ("pl-linruhai", "林如海", None, "pl-jiamin", 1, "lin"),
    ("pl-daiyu", "林黛玉", "pl-linruhai", None, 2, "lin"),
    # 史家：史公 → 史公之子（名佚）→ 史鼐、史鼎、湘云父（名佚）→ 湘云
    ("pl-shigong", "史公\n保龄侯", None, None, 1, "shi"),
    ("vg-shi-son", "史公之子\n（名佚）", "pl-shigong", None, 2, "shi"),
    ("pl-shinai", "史鼐\n保龄侯", "vg-shi-son", None, 3, "shi"),
    ("pl-shiding", "史鼎\n忠靖侯", "vg-shi-son", None, 3, "shi"),
    ("vg-shi-father", "湘云父\n（名佚）", "vg-shi-son", None, 3, "shi"),
    ("pl-xiangyun", "史湘云", "vg-shi-father", None, 4, "shi"),
    # 王家：王公 → 王公长子（凤姐、王仁父，名佚）→ 凤姐、王仁
    ("pl-wanggong", "王公\n县伯", None, None, 1, "wang"),
    ("pl-wangziteng", "王子腾", "pl-wanggong", None, 2, "wang"),
    ("pl-wangfuren", "王夫人", "pl-wanggong", "pl-jiazheng", 2, "wang"),
    ("pl-wangzisheng", "王子胜", "pl-wanggong", None, 2, "wang"),
    ("vg-wang-zhangfang", "王公长子\n（凤姐父，名佚）", "pl-wanggong", None, 2, "wang"),
    ("pl-wangxifeng", "王熙凤", "vg-wang-zhangfang", "pl-jialian", 3, "wang"),
    ("pl-wangren", "王仁", "vg-wang-zhangfang", None, 3, "wang"),
    # 薛家：薛公 → 薛公次子（薛蝌、宝琴父，名佚）→ 薛蝌、宝琴
    ("pl-xuegong", "薛公\n紫薇舍人", None, None, 1, "xue"),
    ("pl-xueyima", "薛姨妈", "pl-xuegong", None, 2, "xue"),
    ("pl-xuepan", "薛蟠", "pl-xueyima", "pl-xiajingui", 3, "xue"),
    ("pl-xuebaochai", "薛宝钗", "pl-xueyima", "pl-baoyu", 3, "xue"),
    ("vg-xue-cifang", "薛公次子\n（薛蝌父，名佚）", "pl-xuegong", None, 2, "xue"),
    ("pl-xueke", "薛蝌", "vg-xue-cifang", "pl-xingxiuyan", 3, "xue"),
    ("pl-xuebaoqin", "薛宝琴", "vg-xue-cifang", None, 3, "xue"),
]
GEN_NOTE = {
    "ning": "宁国府一脉：贾演 → 贾代化 → 贾敬 → 贾珍 → 贾蓉。四代而衰，判词所谓“造衅开端实在宁”。贾代儒、贾蔷等旁支世系失考，单列于后。",
    "rong": "荣国府一脉：贾源 → 贾代善 → 贾赦 / 贾政 → 宝玉一辈 → 贾兰、巧姐。贾芸、贾芹等旁支世系失考，单列于后。",
    "shi": "史家：史公 → 史公之子（名佚）→ 史鼐 / 史鼎 / 湘云父（名佚）→ 湘云。湘云父母双亡，由叔父史鼐、史鼎抚养。",
    "wang": "王家：王公 → 王子腾 / 王夫人 / 王子胜 / 王公长子（凤姐、王仁父，名佚）→ 王熙凤 / 王仁。凤姐是王子腾、王子胜的侄女，不是女儿。",
    "xue": "薛家：皇商。薛姨妈一支为薛蟠、宝钗；薛公次子（名佚）一支为薛蝌、宝琴。两支同辈，非父女。",
}

# 统一与补遗人物重名的 id
for it in P:
    it["id"] = ENRICH.ID_ALIASES.get(it["id"], it["id"])
for r in R:
    r["a"] = ENRICH.ID_ALIASES.get(r["a"], r["a"])
    r["b"] = ENRICH.ID_ALIASES.get(r["b"], r["b"])

# ---------------- 输出 ----------------
seed = {
    "version": 1,
    "title": "红楼梦图谱",
    "families": FAMILIES,
    "roles": ROLES,
    "items": P,
    "relations": R,
    "panels": PANELS,
    "genealogy": [{"id": a, "label": b, "parent": c, "spouse": d, "gen": e, "family": f}
                  for (a, b, c, d, e, f) in GENEALOGY],
    "genealogy_notes": GEN_NOTE,
}

# 判词、诗词、回目并入 items
for fid, fname, quote, detail, rl in FATE:
    seed["items"].append(dict(id=fid, cat="fate", type="判词", name=fname, quote=quote,
                              detail=detail, tags=[]))
    for x in rl:
        seed["relations"].append({"a": fid, "b": x, "label": "对应"})

for pid, pname, author, quote, detail, rl in POETRY:
    seed["items"].append(dict(id=pid, cat="poetry", type="诗词", name=pname, alias=author,
                              quote=quote, detail=detail, tags=[]))
    for x in rl:
        seed["relations"].append({"a": pid, "b": x, "label": "相关"})


# ---------------- 词条富化与增补 ----------------
# 原稿中可修订的提要、别名、标签与家族归属
seed["families"].extend(ENRICH.EXTRA_FAMILIES)
byid = {it["id"]: it for it in seed["items"]}

for iid, txt in ENRICH.SUMMARY_OVERRIDES.items():
    if iid in byid:
        byid[iid]["summary"] = txt
for iid, alias in ENRICH.ALIAS_ADD.items():
    if iid in byid:
        byid[iid]["alias"] = alias
for iid, fam in ENRICH.FAMILY_FIX.items():
    if iid in byid:
        byid[iid]["family"] = fam
for iid, tags in ENRICH.TAGS_ADD.items():
    if iid in byid:
        old = byid[iid].get("tags") or []
        byid[iid]["tags"] = list(dict.fromkeys(old + tags))

# 增补人物、地点、事件、诗词、回目
# 若与既有补遗条目同 id，则以新数据补全旧条目，避免重复
def dedupe_refs(refs):
    out, seen = [], set()
    for r in refs:
        if not r:
            continue
        key = ("web", r.get("label"), r.get("url")) if isinstance(r, dict) else ("text", str(r))
        if key in seen:
            continue
        seen.add(key)
        out.append(r)
    return out

def upsert_item(item, cat):
    item = dict(item)
    item["id"] = ENRICH.ID_ALIASES.get(item["id"], item["id"])
    item.setdefault("cat", cat)
    iid = item["id"]
    if iid in byid:
        dst = byid[iid]
        for k in ("summary", "detail", "alias", "type"):
            if item.get(k):
                dst[k] = item[k]
        if not dst.get("family") and item.get("family"):
            dst["family"] = item["family"]
        if not dst.get("role") and item.get("role"):
            dst["role"] = item["role"]
        dst["tags"] = list(dict.fromkeys((dst.get("tags") or []) + (item.get("tags") or [])))
        dst["refs"] = dedupe_refs((dst.get("refs") or []) + (item.get("refs") or []))
        return dst
    seed["items"].append(item)
    byid[iid] = item
    return item

for p in ENRICH.EXTRA_PEOPLE:
    upsert_item(p, "people")
for p in ENRICH.EXTRA_PLACES:
    upsert_item(p, "place")
for e in ENRICH.EXTRA_EVENTS:
    e = dict(e)
    e.setdefault("type", "情节")
    upsert_item(e, "event")
for p in ENRICH.EXTRA_POEMS:
    p = dict(p)
    p.setdefault("type", "诗词")
    upsert_item(p, "poetry")
for it in getattr(ENRICH, "EXTRA_ITEMS", []):
    upsert_item(it, it.get("cat", ""))
for n, title, detail, tags in ENRICH.EXTRA_CHAPTERS:
    upsert_item(dict(
        id="ch-%d" % n, cat="chapter", type="回目", name="第%d回" % n,
        alias=title, seq=n, summary=title, detail=detail, tags=tags,
        refs=["《红楼梦》第%d回" % n, "中国艺术研究院红楼梦研究所校注本《红楼梦》，人民文学出版社"],
    ), "chapter")

# 合并后再统一家族归属
for iid, fam in ENRICH.FAMILY_FIX.items():
    if iid in byid:
        byid[iid]["family"] = fam

byid = {it["id"]: it for it in seed["items"]}

# 富化正文与参考来源
for iid, txt in ENRICH.DETAIL_OVERRIDES.items():
    if iid in byid:
        # 判词、诗词的原文已由 quote 字段单独展示，详情里不再重复
        if iid.startswith(("fate-", "poem-")) and txt.startswith("【原文】"):
            parts = txt.split("\n\n", 1)
            txt = parts[1] if len(parts) > 1 else ""
        byid[iid]["detail"] = txt

for iid, extra in ENRICH.DETAIL_APPEND.items():
    if iid in byid:
        cur = (byid[iid].get("detail") or "").rstrip()
        if extra not in cur:
            byid[iid]["detail"] = (cur + "\n\n" + extra).strip()

for it in seed["items"]:
    own = it.get("refs") or []
    refs = list(own) + list(ENRICH.REFS.get(it["id"], []))
    if not refs:
        refs = list(ENRICH.DEFAULT_REFS.get(it["cat"], []))
    it["refs"] = dedupe_refs(refs)

for iid, links in ENRICH.WEB_REFS.items():
    if iid in byid:
        byid[iid]["refs"] = dedupe_refs((byid[iid].get("refs") or []) + links)

# 关系去重后追加
seen_rel = {(r["a"], r["b"], r["label"]) for r in seed["relations"]}

def add_rel(a, b, label):
    a = ENRICH.ID_ALIASES.get(a, a)
    b = ENRICH.ID_ALIASES.get(b, b)
    if a in byid and b in byid:
        key = (a, b, label)
        if key not in seen_rel:
            seen_rel.add(key)
            seed["relations"].append({"a": a, "b": b, "label": label})

for a, b, label in ENRICH.EXTRA_RELATIONS:
    add_rel(a, b, label)
for pid, cast in ENRICH.EXTRA_PLACE_CAST.items():
    for x in cast:
        add_rel(pid, x, "所在")
for p in ENRICH.EXTRA_POEMS:
    for x in p.get("related", []):
        add_rel(p["id"], x, "相关")
for e in ENRICH.EXTRA_EVENTS:
    for x in e.get("cast", []):
        add_rel(e["id"], x, "出场")

# 回目与事件的关联；事件按回次排序
CN_DIGITS = {"零": 0, "〇": 0, "一": 1, "二": 2, "两": 2, "三": 3, "四": 4,
             "五": 5, "六": 6, "七": 7, "八": 8, "九": 9}
CN_UNITS = {"十": 10, "百": 100}

def cn_num(s):
    s = s.replace("〇", "零").replace("两", "二")
    if not s:
        return 0
    total = section = num = 0
    for ch in s:
        if ch in CN_DIGITS:
            num = CN_DIGITS[ch]
        elif ch in CN_UNITS:
            unit = CN_UNITS[ch]
            if num == 0:
                num = 1
            section += num * unit
            num = 0
        else:
            return 0
    return total + section + num

def chapter_nums(alias):
    out = []
    for m in re.finditer(r"第?([一二三四五六七八九十百零〇两]+)(?:至第?([一二三四五六七八九十百零〇两]+))?回", alias or ""):
        a = cn_num(m.group(1))
        b = cn_num(m.group(2)) if m.group(2) else a
        if a and b:
            out.extend(range(min(a, b), max(a, b) + 1))
    return sorted(set(out))

for ev in [it for it in seed["items"] if it["cat"] == "event"]:
    nums = chapter_nums(ev.get("alias", ""))
    if nums:
        ev["seq"] = nums[0]
    for n in nums:
        add_rel("ch-%d" % n, ev["id"], "回目")

# 谱系补入贾琮
if not any(g["id"] == "pl-jiacong" and g["family"] == "rong" for g in seed["genealogy"]):
    seed["genealogy"].append({"id": "pl-jiacong", "label": "贾琮", "parent": "pl-jiashe",
                              "spouse": None, "gen": 4, "family": "rong"})
GEN_NOTE.setdefault("lin", "林家：林如海 → 林黛玉；贾敏为林如海妻、黛玉之母。黛玉六岁丧母，入贾府依外祖母，是“还泪”之旅的开始。")

# 谱系中的「名佚」补位节点只存在于 genealogy 中，不再生成人物词条
_item_ids = {it["id"] for it in seed["items"]}

# 谱系中的亲子、婚姻关系补进关系表，保证谱系图与关系图一致
FEMALE = {
    "pl-jiamu", "pl-xingfuren", "pl-wangfuren", "pl-jiamin", "pl-daiyu", "pl-jiayuanchun",
    "pl-yingchun", "pl-tanchun", "pl-xichun", "pl-wangxifeng", "pl-qiaojie", "pl-livan",
    "pl-xuebaochai", "pl-xueyima", "pl-xiangling", "pl-xiajingui", "pl-xiangyun",
    "pl-youerjie", "pl-yousanjie", "pl-youshi", "pl-qinkeqing", "pl-miaoyu", "pl-xingxiuyan",
    "pl-liwen", "pl-liqi", "pl-xuebaoqin", "pl-hushi", "pl-youlaniang", "pl-zhouyiniang",
    "pl-zhaoyiniang", "pl-jinchuan", "pl-yuchuan", "pl-yuanyang", "pl-pinger", "pl-xiren",
    "pl-qingwen", "pl-sheyue", "pl-ziyuan", "pl-xueyan", "pl-yinger", "pl-siqi", "pl-shishu",
    "pl-ruhua", "pl-xiaohong", "pl-fangguan", "pl-lingguan", "pl-ouguan", "pl-liuwuer",
    "pl-cuimo", "pl-cuilv", "pl-xiuju", "pl-suyun", "pl-biyue", "pl-hupo", "pl-qiuwen",
    "pl-bihen", "pl-qianxue", "pl-chunyan", "pl-sier", "pl-zhuier", "pl-wenguan",
    "pl-ruiguan", "pl-ouguan2", "pl-wangqinghui", "pl-xujunbaoyi", "pl-yanrui", "pl-zhushuzhen",
}
_rel_keys = {(r["a"], r["b"], r["label"]) for r in seed["relations"]}
def _link(a, b, label):
    if a and b and a != b and a in _item_ids and b in _item_ids and (a, b, label) not in _rel_keys:
        _rel_keys.add((a, b, label))
        seed["relations"].append({"a": a, "b": b, "label": label})

for g in seed["genealogy"]:
    if g.get("parent"):
        _link(g["parent"], g["id"], "父女" if g["id"] in FEMALE else "父子")
    if g.get("spouse"):
        _link(g["id"], g["spouse"], "夫妻")

# 从详述里拆出【结局】【评析】，供人物弹窗单独展示
import re as _re

def _sections(text):
    out = {}
    parts = _re.split(r"【([^】]+)】", text or "")
    for i in range(1, len(parts) - 1, 2):
        out[parts[i].strip()] = parts[i + 1].strip()
    return out

for it in seed["items"]:
    if it["cat"] != "people":
        continue
    sec = _sections(it.get("detail"))
    if not it.get("ending") and sec.get("结局"):
        it["ending"] = sec["结局"]
    if not it.get("comment") and sec.get("评析"):
        it["comment"] = sec["评析"]

# 脂评：只收广为引用、出处明确的几条，其余留空（前端会显示「暂无」）
ZHIPI = {
    "pl-qingwen": "「晴有林风，袭乃钗副。」——脂砚斋批语（庚辰本）",
    "pl-xiren": "「晴有林风，袭乃钗副。」——脂砚斋批语（庚辰本）",
    "pl-daiyu": "「能解者方有辛酸之泪，哭成此书。」——甲戌本第一回脂批",
    "pl-baoyu": "「字字看来皆是血，十年辛苦不寻常。」——甲戌本凡例诗（脂批系统）",
}
for it in seed["items"]:
    if it["id"] in ZHIPI and not it.get("zhipi"):
        it["zhipi"] = ZHIPI[it["id"]]

# 统计面板按实际数据重算
from collections import Counter
people = [it for it in seed["items"] if it["cat"] == "people"]
role_counts = Counter(p.get("role") or "未分" for p in people)
seed["panels"][0]["rows"] = [{"label": r, "value": role_counts[r]} for r in ROLES if role_counts[r]]
family_counts = Counter(p.get("family") for p in people)
seed["panels"][1]["rows"] = [
    {"label": f["name"], "value": family_counts[f["id"]]}
    for f in seed["families"] if family_counts.get(f["id"])
]
all_panels = list(seed["panels"]) + list(ENRICH.EXTRA_PANELS)
seen_panel = set()
seed["panels"] = []
for p in all_panels:
    if p["title"] not in seen_panel:
        seen_panel.add(p["title"])
        seed["panels"].append(p)

# 事件与人物：文本里提到的人名/别号补「涉及」关系（手工的「出场」优先保留）
event_items = [it for it in seed["items"] if it["cat"] == "event"]
people_items = [it for it in seed["items"] if it["cat"] == "people"]
existing_cast = {}
for r in seed["relations"]:
    if r["label"] == "出场":
        existing_cast[(r["a"], r["b"])] = 1

# 每个人可用于匹配的名字：全名 + 别名（别名短且有歧义的只用全名）
NAME_INDEX = []
for p in people_items:
    names = [p["name"]]
    alias = (p.get("alias") or "").strip()
    if alias:
        for a in re.split(r"[、，,]", alias):
            a = a.strip()
            if len(a) >= 2 and a != p["name"] and a not in ("凤姐", "宝玉", "黛玉", "宝钗"):
                names.append(a)
    NAME_INDEX.append((p["id"], names))

for ev in event_items:
    text = (ev.get("summary") or "") + (ev.get("detail") or "") + (ev.get("alias") or "")
    for pid, names in NAME_INDEX:
        if (ev["id"], pid) in existing_cast:
            continue
        if any(n and n in text for n in names):
            seed["relations"].append({"a": ev["id"], "b": pid, "label": "涉及"})

# 去重合并：同一 id 只保留一份，后到的（富化数据）优先，缺失字段用前一份补
merged = {}
for it in seed["items"]:
    old = merged.get(it["id"])
    if old is None:
        merged[it["id"]] = dict(it)
    else:
        out = dict(old)
        for k, v in it.items():
            if v not in (None, "", [], {}):
                out[k] = v
            elif k not in out:
                out[k] = v
        merged[it["id"]] = out
seed["items"] = list(merged.values())

# 同名去重：优先保留已有关系更多的那个 id
deg = {}
for r in seed["relations"]:
    deg[r["a"]] = deg.get(r["a"], 0) + 1
    deg[r["b"]] = deg.get(r["b"], 0) + 1
by_name = {}
alias = {}
for it in seed["items"]:
    key = (it["cat"], it["name"])
    if key in by_name:
        keep = by_name[key]
        drop = it
        if deg.get(drop["id"], 0) > deg.get(keep["id"], 0):
            keep, drop = drop, keep
        alias[drop["id"]] = keep["id"]
        by_name[key] = keep
    else:
        by_name[key] = it
if alias:
    seed["items"] = [it for it in seed["items"] if it["id"] not in alias]
    for r in seed["relations"]:
        r["a"] = alias.get(r["a"], r["a"])
        r["b"] = alias.get(r["b"], r["b"])
    for g in seed["genealogy"]:
        g["id"] = alias.get(g["id"], g["id"])
        if g.get("parent"):
            g["parent"] = alias.get(g["parent"], g["parent"])
        if g.get("spouse"):
            g["spouse"] = alias.get(g["spouse"], g["spouse"])

# 关系去重（同一对 + 同一标签只留一条）
seen_rel, rels = set(), []
for r in seed["relations"]:
    key = (r["a"], r["b"], r["label"])
    if key in seen_rel:
        continue
    seen_rel.add(key)
    rels.append(r)
seed["relations"] = rels

# 谱系去重（family + item_id 唯一）
seen_gen, gen = set(), []
for g in seed["genealogy"]:
    key = (g["family"], g["id"])
    if key in seen_gen:
        continue
    seen_gen.add(key)
    gen.append(g)
seed["genealogy"] = gen

# 事件、回目按回次排序；其余类别保持原有编排
CAT_ORDER = {"people": 0, "place": 1, "event": 2, "chapter": 3, "fate": 4, "poetry": 5}
def _sort_key(it):
    cat = it["cat"]
    if cat == "fate":
        return (CAT_ORDER[cat], 0 if it["id"] == "fate-jinling" else 1, 0)
    return (CAT_ORDER.get(cat, 9),
            it.get("seq") or 0 if cat in ("event", "chapter") else 0)

seed["items"].sort(key=_sort_key)

# 谱系校验：同一家族内不重复、父代必须存在、配偶若也在本图则不再外挂
for fam in sorted({x["family"] for x in seed["genealogy"]}):
    rows = [x for x in seed["genealogy"] if x["family"] == fam]
    ids = {x["id"] for x in rows}
    dup = [x["id"] for x in rows if [y["id"] for y in rows].count(x["id"]) > 1]
    if dup:
        print("  ! 谱系重复节点", fam, sorted(set(dup)))
    for x in rows:
        if x["id"] not in byid and not x["id"].startswith("vg-"):
            print("  ! 谱系节点无对应词条", fam, x["id"])
        if x.get("parent") and x["parent"] not in ids:
            print("  ! 谱系父节点缺失", fam, x["id"], "->", x["parent"])
        if x.get("parent") and x["parent"] in ids:
            pgen = next(y["gen"] for y in rows if y["id"] == x["parent"])
            if pgen >= x["gen"]:
                print("  ! 谱系世代倒置", fam, x["id"], pgen, "->", x["gen"])
        if x.get("spouse") and x["spouse"] not in ids and x["spouse"] not in byid:
            print("  ! 谱系配偶缺失", fam, x["id"], "->", x["spouse"])
    both = [(x["id"], x["spouse"]) for x in rows if x.get("spouse") in ids]
    if both:
        print("  ! 配偶同时是本图节点（会自动改画婚线）", fam, both)

out = os.path.join(ROOT, "db", "seed.json")
with open(out, "w", encoding="utf-8") as f:
    json.dump(seed, f, ensure_ascii=False, indent=1)
    f.write("\n")

print("items:", len(seed["items"]), "relations:", len(seed["relations"]))
print("by cat:", {c: sum(1 for i in seed["items"] if i["cat"] == c)
                  for c in sorted({i["cat"] for i in seed["items"]})})
