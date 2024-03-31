export interface Node extends d3.SimulationNodeDatum {
    id: string;
    group: string;
    label: string;
  }
  
  export interface Link extends d3.SimulationLinkDatum<Node> {
    source: string;
    target: string;
    value: number;
  }
  
  export type Data = {
    nodes: Node[];
    links: Link[];
  };
  
  export const data = {
    nodes: [
      { id: 'Myriel', group: 'team1' , label: 'google.com'},
      { id: 'Anne', group: 'team1', label: 'google.com' },
      { id: 'Gabriel', group: 'team1' , label: 'google.com'},
      { id: 'Mel', group: 'team1' , label: 'google.com'},
      { id: 'Yan', group: 'team2' , label: 'google.com'},
      { id: 'Tom', group: 'team2' , label: 'google.com'},
      { id: 'Cyril', group: 'team2', label: 'google.com'},
      { id: 'Tuck', group: 'team2', label: 'google.com' },
      { id: 'Antoine', group: 'team3' , label: 'google.com'},
      { id: 'Rob', group: 'team3', label: 'google.com'},
      { id: 'Napoleon', group: 'team3' , label: 'google.com'},
      { id: 'Toto', group: 'team4' , label: 'google.com'},
      { id: 'Tutu', group: 'team4' , label: 'google.com'},
      { id: 'Titi', group: 'team4' , label: 'google.com'},
      { id: 'Tata', group: 'team4' , label: 'google.com'},
      { id: 'Turlututu', group: 'team4' , label: 'google.com'},
      { id: 'Tita', group: 'team4', label: 'google.com' },
    ],
    links: [
      { source: 'Anne', target: 'Myriel', value: 1 },
      { source: 'Napoleon', target: 'Myriel', value: 1 },
      { source: 'Gabriel', target: 'Myriel', value: 1 },
      { source: 'Mel', target: 'Myriel', value: 1 },
      { source: 'Yan', target: 'Tom', value: 1 },
      { source: 'Tom', target: 'Cyril', value: 1 },
      { source: 'Tuck', target: 'Myriel', value: 1 },
      { source: 'Tuck', target: 'Mel', value: 1 },
      { source: 'Tuck', target: 'Myriel', value: 1 },
      { source: 'Mel', target: 'Myriel', value: 1 },
      { source: 'Rob', target: 'Antoine', value: 1 },
      { source: 'Tata', target: 'Tutu', value: 1 },
      { source: 'Tata', target: 'Titi', value: 1 },
      { source: 'Tata', target: 'Toto', value: 1 },
      { source: 'Tata', target: 'Tita', value: 1 },
      { source: 'Tita', target: 'Toto', value: 1 },
      { source: 'Tita', target: 'Titi', value: 1 },
      { source: 'Tita', target: 'Turlututu', value: 1 },
      { source: 'Rob', target: 'Turlututu', value: 1 },
    ],
  };
  