interface Rounds {
  items: Round[];
}

interface Round {
  id: string;
  name: string;
  problemBlobKey: string;
  active: boolean;
  open: boolean;
  start: string;
  end: string;
  dataSets: DataSet[];
}

interface DataSet {
  id: string;
  name: string;
  inputBlobKey: string;
}
