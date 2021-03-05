export default function() {
  return {
    // test pools
    pools: [
      {
        id: 7,
        title: "The Lekker Project",
        slug: "lekkerman",
        hard_cap: 10000000,
        type: "Fixed",
        access_type: "Public",
        progress: 0.75,
        participants: 100,
        status: "closed",
        web_links: [
          {
            website: "https://www.thissite.com",
            whitepaper: "",
            twitter: "https://www.twitter.com",
            telegram: "https://www.telegram.com"
          }
        ],
        white_listed_addresses: {},
        avatar:
          "https://en.gravatar.com/userimage/49006266/c2a582608aa64ce391d6092f7b384900.jpeg",
        tag_line:
          "This is a very lekker project that you should put all your dogecoins into",
        description:
          "#Project ##Make this markdownable? How would one do that?",
        owner: "0x33891316e3b032afbd926597aC78c34Ba545900e",
        token_address: "0xD478161C952357F05f0292B56012Cd8457F1cfbF",
        maximum_allocation: "10684.000000000002",
        minimum_swap: "0",
        soft_cap: 25,
        hard_cap: 50,

        // Upcoming
        pool_open: new Date("01 Apr 2021 00:00:00 UTC").valueOf(),
        private_end: new Date("10 May 2021 10:00:00 UTC").valueOf(),
        public_end: new Date("06 Jun 2021 03:04:05 UTC").valueOf(),

        // Open
        // pool_open: new Date("02 Jan 2019 03:04:05 UTC").valueOf(),
        // private_end: new Date("20 Mar 2021 15:00:00 UTC").valueOf(),
        // public_end: new Date("25 Mar 2021 03:04:05 UTC").valueOf(),

        // Closed
        // pool_open: new Date("02 Nov 2020 00:00:00 UTC").valueOf(),
        // private_end: new Date("25 Dec 2020 10:00:00 UTC").valueOf(),
        // public_end: new Date("06 Jan 2021 01:00:00 UTC").valueOf(),

        swap_amount: "1200000",
        swap_ratio: "0.000021"
      }
      // {
      //   id: 6,
      //   title: "The Do Project",
      //   slug: "do-it",
      //   hard_cap: 9001,
      //   type: "Fixed",
      //   access_type: "Public",
      //   progress: 0.75,
      //   participants: 100,
      //   status: "closed",
      //   web_links: {
      //     website: "https://www.example.com",
      //     whitepaper: "",
      //     twitter: "https://www.twitter.com",
      //     telegram: "https://www.telegram.com"
      //   },
      //   white_listed_addresses: {},
      //   avatar: "",
      //   tag_line: "Just do it",
      //   description: "More descriptions",
      //   contract_address: "0x33891316e3b032afbd926597aC78c34Ba545900e",
      //   token_address: "0xD478161C952357F05f0292B56012Cd8457F1cfbF",
      //   inverse_swap_ratio: 5555.22222222,
      //   is_atomic: false,
      //   maximum_allocation: 0.3333333333333333,
      //   min_swap_level: "6000",
      //   minimum_swap: "0",
      //   soft_cap: "60000",

      //   pool_open: new Date("02 Jan 2019 03:04:05 UTC").valueOf(),
      //   private_end: new Date("20 Mar 2021 15:00:00 UTC").valueOf(),
      //   public_end: new Date("25 Mar 2021 03:04:05 UTC").valueOf(),

      //   swap_amount: "1200000",
      //   swap_ratio: "0.000021"
      // },
      // {
      //   id: 5,
      //   title: "The Better Project",
      //   slug: "betterboi",
      //   hard_cap: 501400,
      //   type: "Fixed",
      //   access_type: "Private",
      //   progress: 0.4,
      //   participants: 100,
      //   status: "closed",
      //   web_links: {
      //     twitter: "https://www.twitter.com",
      //     telegram: "https://www.telegram.com"
      //   },
      //   white_listed_addresses: {},
      //   avatar: "",
      //   tag_line: "This project is better than all other projects",
      //   description: "A very much longer descriptions",
      //   contract_address: "0x33891316e3b032afbd926597aC78c34Ba545903f",
      //   token_address: "0xD478161C952357F05f0292B56012Cd8457F1cfbG",
      //   inverse_swap_ratio: 1234.04761904762,
      //   is_atomic: false,
      //   maximum_allocation: 0.4436400000000004,

      //   min_swap_level: "582844",
      //   minimum_swap: "0.1",
      //   soft_cap: "582844",
      //   pool_open: 1614253842,
      //   private_end: 1616673042,
      //   public_end: 1616873042,
      //   swap_amount: "10000000",
      //   swap_ratio: "0.000021"
      // }
    ]
  };
}
