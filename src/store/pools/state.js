export default function() {
  return {
    // test pools
    pools: [
      {
        id: 1,
        title: "The Lekker Project",
        slug: "lekkerman",
        price: 5000,
        type: "Fixed",
        access_type: "Public",
        progress: 0.75,
        participants: 100,
        status: "Upcoming",
        web_links: {
          website: "https://www.thissite.com",
          whitepaper: "",
          twitter: "https://www.twitter.com",
          telegram: "https://www.telegram.com"
        },
        white_listed_addresses: {},
        image_link:
          "https://en.gravatar.com/userimage/49006266/c2a582608aa64ce391d6092f7b384900.jpeg",
        short_description:
          "This is a very lekker project that you should put all your dogecoins into",
        long_description:
          "#Project ##Make this markdownable? How would one do that?",
        contract_address: "0x33891316e3b032afbd926597aC78c34Ba545900e",
        token_address: "0xD478161C952357F05f0292B56012Cd8457F1cfbF",
        inverse_swap_ratio: 47619.04761904762,
        is_atomic: false,
        max_eth_allocation: 0.22436400000000004,
        maximum_allocation_per_wallet: "10684.000000000002",
        min_swap_level: "582804",
        minimum_allocation_per_wallet: "0",
        minimum_raise: "582804",
        start_date: 1613663539499,
        // start_date: 1615363842000,
        end_private_date: 1616363842000,
        // end_public_date: 1614663586191,
        end_public_date: 1617363842000,
        swap_amount: "1200000",
        swap_ratio: "0.000021"
      },
      {
        id: 2,
        title: "The Better Project",
        slug: "betterboi",
        price: 501400,
        type: "Fixed",
        access_type: "Private",
        progress: 0.4,
        participants: 100,
        status: "Closed",
        web_links: {
          twitter: "https://www.twitter.com",
          telegram: "https://www.telegram.com"
        },
        white_listed_addresses: {},
        image_link: "",
        short_description: "This project is better than all other projects",
        long_description: "A very much longer descriptions",
        contract_address: "0x33891316e3b032afbd926597aC78c34Ba545903f",
        token_address: "0xD478161C952357F05f0292B56012Cd8457F1cfbG",
        inverse_swap_ratio: 1234.04761904762,
        is_atomic: false,
        max_eth_allocation: 0.4436400000000004,
        maximum_allocation_per_wallet: "10584.000000000002",
        min_swap_level: "582844",
        minimum_allocation_per_wallet: "0.1",
        minimum_raise: "582844",
        start_date: 1614253842,
        end_private_date: 1616673042,
        end_public_date: 1616873042,
        swap_amount: "10000000",
        swap_ratio: "0.000021"
      }
    ]
  };
}
