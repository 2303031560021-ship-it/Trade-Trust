import * as ort from "onnxruntime-web";

let damageSession = null;
let dealSession = null;

export async function loadDamageModel() {
  if (!damageSession) {
    damageSession = await ort.InferenceSession.create(
      "/models/damage_model.onnx"
    );
  }

  return damageSession;
}

export async function loadDealModel() {
  if (!dealSession) {
    dealSession = await ort.InferenceSession.create(
      "/models/smartbuy_model.onnx"
    );
  }

  return dealSession;
}