import system from "./apis/system";
import logs from "./apis/logs";
import pdos from "./apis/pdos";

export default {
  ...system,
  ...logs,
  ...pdos
}
