<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { initializeWechatCloud } from "./platforms/wechat/cloud";
import { sessionStore } from "./stores";

onLaunch(() => {
  // #ifdef MP-WEIXIN
  initializeWechatCloud();
  void sessionStore.load();
  // #endif
});
onShow(() => {
});
onHide(() => {
});
</script>
<style></style>
