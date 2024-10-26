# src/tests/test_routes.py
from flask  import Blueprint, render_template, jsonify, request
from prism.db    import test_connection
from prism.claude import analyze_text
from prism.routes import route

@main.route('/api/analyze', methods = ['POST'])
def analyze_mock():
    test_text = {
        "nodes": [
            {
                "id": "policy3",
                "type": "policy",
                "name": "w",
                "description": "w",
                "position": {"x": -90, "y": 0, "z": 130}
            },
            {
                "id": "policy1",
                "type": "policy",
                "name": "倫理的に問題のある法案",
                "description": "ぎりぎりを攻めてみて、どこまで行けるか試してみる",
                "position": {"x": 0, "y": 0, "z": 0}
            },
            {
                "id": "person1",
                "type": "person",
                "name": "山本太郎",
                "description": "あああああああああああああああああああああああああああああああああああああああああああああああああああああああああああ",
                "position": {"x": 30, "y": 0, "z": 30}
            },
            {
                "id": "policy2",
                "type": "policy",
                "name": "AI規制法案日本国とアメリカ合衆国との間の相互協力及び安全保障条約第六条に基づく施設及び区域並びに日本国における合衆国軍隊の地位に関する協定及び日本国における国際連合の軍隊の地位に関する協定の実施に伴う道路運送法等の特例に関する法律",
                "description": "なんかすごく名前がめっちゃ長い法案",
                "position": {"x": -30, "y": 0, "z": 30}
            },
            {
                "id": "person2",
                "type": "person",
                "name": "ダブチ食べ美",
                "description": "マクドナルド大日本帝國支店支店長補佐の娘の嫁とは関係のないマスコットキャラクター",
                "position": {"x": 0, "y": 0, "z": 60}
            },
            {
                "id": "person3",
                "type": "person",
                "name": "a",
                "description": "a",
                "position": {"x": 30, "y": 0, "z": 30}
            }
        ],
        "edges": [
            {
                "source": "person1",
                "target": "policy1",
                "label": "提案"
            },
            {
                "source": "person2",
                "target": "policy1",
                "label": "推進"
            },
            {
                "source": "person2",
                "target": "policy2",
                "label": "Are you ready.Adrenaline is pumping, Adrenaline is pumping,Generator. Automatic Lover,Atomic, Atomic, Overdrive, Blockbuster, Brainpower,Call me a leader. Cocaine, Don't you try it, Don't you try it,Innovator, Killer machine, There's no fate.Take control. Brainpower, Let the bass kick!O-oooooooooo AAAAE-A-A-I-A-U- JO-oooooooooooo AAE-O-A-A-U-U-A- E-eee-ee-eee AAAAE-A-E-I-E-A- JO-ooo-oo-oo-oo EEEEO-A-AAA-AAAA, O-oooooooooo AAAAE-A-A-I-A-U- JO-oooooooooooo AAE-O-A-A-U-U-A- E-eee-ee-eee AAAAE-A-E-I-E-A- JO-ooo-oo-oo-oo EEEEO-A-AAA-AAAA, O-oooooooooo AAAAE-A-A-I-A-U- JO-oooooooooooo AAE-O-A-A-U-U-A- E-eee-ee-eee AAAAE-A-E-I-E-A- JO-ooo-ooo-oooo EEEEO-A-AAA-AAA- O----------"
            }
        ]
    }
    return jsonify(test_text)
