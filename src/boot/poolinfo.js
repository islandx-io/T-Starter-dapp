const defaultPoolInfo = {
  title: "Loading",
  slug: "loading",
  soft_cap: "Loading",
  hard_cap: "Loading",
  swap_ratio: { quantity: "Loading", contract: "token.start" },
  type: "Fixed",
  access_type: "Loading",
  progress: 0,
  participants: 0,
  avatar: "",
  tag_line: "Loading",
  description: "Loading",
  web_links: {},
  status: "loading",
  pool_open: "Loading",
  private_end: "Loading",
  public_end: "Loading",
  white_listed_addresses: {},
  contract_address: "",
  token_address: "",
  maximum_allocation: "0",
  minimum_swap: "0",
  base_token: { sym: "8,Loading", contract: "btc.ptokens" }
};

export default ({ Vue }) => {
  Vue.prototype.$defaultPoolInfo = defaultPoolInfo;
};
