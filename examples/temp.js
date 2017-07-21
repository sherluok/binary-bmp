const str =
`
###   ###  #   #   ##   ###   #   #    ###   #   #  ###
#  #   #   ##  #  #  #  #  #   # #     #  #  ## ##  #  #
###    #   # # #  ####  ###     #      ###   # # #  ###
#  #   #   #  ##  #  #  #  #    #      #  #  #   #  #
###   ###  #   #  #  #  #  #    #      ###   #   #  #    `;

let lines = str.split('\n').slice(1);
const max = Math.max(...(lines.map(line => line.length)));
lines = lines.map(line => line.padEnd(max, ' '));
console.log(lines);
console.log(max, lines.length);

const data = lines.map(line => {
 return [...line].map(c => {
  if (c === '#') {
   return Math.floor(Math.random() * 15) % 16;
  } else {
   return 15;
  }
 }).join(',')
}).join(',\n');
console.log(data);
