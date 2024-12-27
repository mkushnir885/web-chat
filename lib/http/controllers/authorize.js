import HttpError from "../http-error.js";

export default function authorize(client) {
  if (!client.isAuthenticated()) {
    throw new HttpError(403, "Not authorized");
  }
}
