export function convertTimestamp(ts,short=false){
  let options
  if (short)
  {
    options = { year: 'numeric', month: 'numeric', day: 'numeric'};
  }
  else{
    options = { year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric' };
  }

    return Intl.DateTimeFormat('de-DE',options).format(ts)
  }