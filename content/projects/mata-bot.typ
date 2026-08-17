#import "../typst/lib.typ": doc, meta
#show: doc

#meta((
  title: "Mata-Bot",
  year: 2024,
  summary: "A Discord bot for designing, visualising, testing, converting, and minimising finite automata.",
  kind: "bot",
  stack: (
    (name: "Python", url: "https://www.python.org"),
    (name: "Hikari", url: "https://github.com/hikari-py/hikari"),
    (name: "Lightbulb", url: "https://github.com/tandemdude/hikari-lightbulb"),
    (name: "Miru", url: "https://github.com/hypergonial/hikari-miru"),
    (name: "Graphviz", url: "https://graphviz.org"),
    "MySQL",
  ),
  live: none,
  repo: "https://github.com/Hout-Manut/Automata-Bot",
  status: "shipped",
  order: none,
  placeholder: false,
))

For my second-year final project at CADT, I – with #link(
  "https://github.com/chimlimhao",
)[Chim Limhao] – built a Discord bot for working with finite automata. Instead
of a command-line tool, users enter an automaton via slash command, see its
diagram, and interact with it right in the conversation.

It supports both DFA and NFA: validates input, renders the state graph, and
exposes operations through an interactive menu.

#figure(
  image(
    "mata-bot-figures/command.png",
    alt: "Discord slash-command autocomplete showing the /design command with a \"recent\" option highlighted.",
  ),
  caption: [Discord's slash-command menu surfacing `/design` and its `recent`
    option.],
)

= Entering an automaton

A finite automaton is five values: states, alphabet, initial state, final
states, transition function. The bot collects these in a Discord modal, then
parses the text into an `FA` object.

The parser accepts compact formats like `q0,a=q1`, `q0+a->q1`, and `q1,=q2`
(epsilon). Regex handles the different separators while keeping the
representation consistent:

#figure(
  image(
    "mata-bot-figures/modal.png",
    alt: "Discord modal titled \"Enter FA Data\" with fields for states, alphabets, initial states, final states, and transition functions.",
  ),
  caption: [The "Enter FA Data" modal, where states, alphabets, initial/final
    states, and transitions are typed in.],
)

```python
TransitionT = dict[tuple[str, str], set[str]]
```

Before building the object, it checks initial/final states belong to the state
set, every transition uses known states, and every non-epsilon symbol is in the
alphabet. It then classifies DFA vs NFA by checking whether every state has
exactly one destination per input symbol.

= One result, several operations

Once parsed, the bot shows it as a Discord embed with a Graphviz diagram. Same
screen lets you:

- test whether a string is accepted;
- convert NFA to DFA via subset construction;
- minimise a DFA (remove unreachable states, merge equivalent ones);
- edit and regenerate.

String testing is DFS: follows epsilon transitions before consuming the next
char, accepts if any branch ends in a final state. Same routine covers DFA and
NFA.

Conversion view explains the subset construction via the state closures used.
Minimisation view reports which states were removed or unreachable, not just a
smaller diagram.

= History that stays useful

Users save and retrieve automata via the `recent` option. MySQL stores the
automaton data with Discord user ID and last-used timestamp. A separate
recent-history command supports renaming, editing, deleting, and filtering by
type, state count, alphabet, symbols, or age.

#figure(
  image(
    "mata-bot-figures/recent.png",
    alt: "Autocomplete list for the /recent command showing past automata with type, state/input counts, starting state, and time since last use.",
  ),
  caption: [`/recent` autocomplete listing saved automata by type, size, and
    age, e.g. "A DFA with 3 states, 2 inputs. Starts at q0. ~ 7 days ago".],
)

Autocomplete stays fast: queries only the current user's records, shows most
recent first, keeps a short in-memory cache for filtering. A scheduled task
clears that cache so stale data doesn't build up.

= What I learned

This was an exercise in turning formal-language algorithms into an incremental,
usable interface. The hard parts: not just conversion and minimisation, but
making invalid input recoverable, keeping Discord interaction stateful, and
presenting algorithmic results for inspection.

Also gave me practical experience wiring several app layers together: Discord
slash commands/modals at the boundary, a small automaton domain model, Graphviz
for output, MySQL for history.
