import { OrderStatus } from "@geticketmicro/common";
import { Document, Model, model, Schema } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

export interface OrderAttrs {
  id: string;
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

interface OrderDoc extends Document {
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

interface OrderModel extends Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

orderSchema.set("versionKey", "version");
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order({
    _id: attrs.id,
    version: attrs.version,
    userId: attrs.userId,
    price: attrs.price,
    status: attrs.status,
  });
};

const Order = model<OrderDoc, OrderModel>("Order", orderSchema);

export {Order}
