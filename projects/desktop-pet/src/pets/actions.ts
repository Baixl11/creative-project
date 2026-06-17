import { PetAction } from "../types";

export const petActionsById: Record<string, PetAction[]> = {
  "line-dog": [
    { id: "dog-wander", label: "原地徘徊", durationMs: 4400 },
    { id: "dog-bark", label: "汪汪汪", durationMs: 3600, bubbleText: "汪汪汪" },
    { id: "dog-hop-side", label: "左右跳", durationMs: 4200 }
  ],
  "line-cat": [
    { id: "cat-stretch", label: "伸懒腰", durationMs: 4600 },
    { id: "cat-scratch-ear", label: "挠耳朵", durationMs: 3800, propText: "抓抓" }
  ],
  "line-rabbit": [
    { id: "rabbit-carrot", label: "啃胡萝卜", durationMs: 4200, propText: "胡萝卜" },
    { id: "rabbit-hop", label: "跳一下", durationMs: 3400 }
  ],
  "line-cow": [
    { id: "cow-moo", label: "哞！！！", durationMs: 3800, bubbleText: "哞！！！" },
    { id: "cow-stomp", label: "蹄子蹬地", durationMs: 4200, propText: "咚" }
  ],
  "line-alpaca": [
    { id: "alpaca-spit", label: "吐口水", durationMs: 3600, propText: "噗" },
    { id: "alpaca-lie-down", label: "趴下", durationMs: 4800 }
  ]
};

export function getPetActions(petId: string): PetAction[] {
  return petActionsById[petId] ?? [];
}
