const loading = "Loading";

const defaultPoolInfo = {
  // In contract
  owner: loading,
  pool_type: loading,
  title: loading,
  avatar: "",
  tag_line: loading,
  description: loading,
  status: loading,
  base_token: { sym: "8," + loading, contract: loading },
  swap_ratio: { quantity: loading, contract: loading },
  soft_cap: loading,
  hard_cap: loading,
  minimum_swap: loading,
  maximum_swap: loading,
  remaining_offer: loading,
  remaining_ask: loading,
  total_raise: loading,
  participants: loading,
  pool_open: loading,
  premium_end: loading,
  public_end: loading,
  whitelist: [],
  web_links: loading,
  // Not in contract
  slug: loading,
  pool_status: loading,
  access_type: loading,
  progress: 0
};

export default ({ Vue }) => {
  Vue.prototype.$defaultPoolInfo = defaultPoolInfo;
};
