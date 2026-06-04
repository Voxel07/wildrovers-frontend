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

export function formatNumber(number){
  return Intl.NumberFormat('en',
  {
      notation:'compact'
  }).format(number);
}

const roles = ["Besucher", "Frischling", "Mitglied", "Vorstand", "Admin"];

export function hasRequiredRole(userRole, requiredRole) {
  if (!userRole) return false;
  if (!requiredRole) return true;
  const userIndex = roles.indexOf(userRole);
  const requiredIndex = roles.indexOf(requiredRole);
  if (userIndex === -1 || requiredIndex === -1) return false;
  return userIndex >= requiredIndex;
}
