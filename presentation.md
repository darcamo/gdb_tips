

class: center, middle, hide-slide-number, hide-logo
background-image: url(figs/circles.svg)
background-size: cover
background-position: 0 50px
name: title-slide

.titleblock[
# GDB Tips
]

.authorsblock[
Darlan Cavalcante Moreira

![logo](figs/logo.svg)

Some Text Some Text Some Text

August 29, 2019
]

.footnote[Created with [{Remark.js}](http://remarkjs.com/) using
[{Markdown}](https://daringfireball.net/projects/markdown/) +
[{MathJax}](https://www.mathjax.org/)]

---

class:middle, hide-logo, hide-slide-number

# .center[Agenda]

![:toc 2, 20]

---

# This is the slide tittle

https://kohei.us/2009/12/22/setting-break-point-where-an-exception-is-thrown/


---

# Inicializando o GDB

```bash
gdb <executável>
```

```gdb
set args <command_line_parameters>
start
```

- Use <kbd>Ctrl</kbd>+<kbd>x</kbd> <kbd>A</kbd> para alternar entre a interface TUI e a interface normal
- Use <kbd>Ctrl</kbd>+<kbd>x</kbd> <kbd>2</kbd> para dividir a tela
- Use <kbd>Ctrl</kbd>+<kbd>x</kbd> <kbd>1</kbd> para voltar para uma única tela


---

# Python

- GDB possui o interpretador python integrado

- Use `python gdb.execute()` para executar comandos do gdb
- Use `python gdb.parse_and_eval()` para pegar ter no python um valor do gdb
- Use `python help('gdb')` para ver documentação online

- Exemplos

```gdb
python bp = gdb.Breakpoint('main.cpp:13')
python bp.enable=False
python bps = gdb.breakpoints()
python var_i = gdb.parse_and_eval('i')
```

---

# Python Pretty Printers

```gdb
set print pretty on
```

```python
class MyPrinter(object):
    def __init__(self, val):
        self.val = val
    def to_string(self):
        return (self.val['member'])

import gdb.printing
pp = gdb.printing.RegexpCollectionPrettyPrinter("mystruct")
pp.add_printer("mystruct", "^mystruct$", MyPrinter)
```

![:box happy, Nota](Coloque em um arquivo python e chame "source filename.py")

![:box moody, Dica](
```gdb
source path_to_cppsim/gdb_helpers/gdb_cppsim_printers.py
source path_to_cppsim/gdb_helpers/gdb_armadillo_printers.py
```
)

---

# Auto-load Pretty Printers

In the cppsim project root folder, there is a .gdbinit file that automatically
load these pretty-printer files. However, it will only be read if you start gdb
from the project root folder AND if the path where cppsim was cloned as set as
safe in the .gdbinit file in your home folder. That is, add the following code
to the .gdbinit file in your home folder (create it if it does not exist).

```gdb
set auto-load local-gdbinit on
add-auto-load-safe-path <full_path_where_cppsim_was_cloned>
```

After that, open a terminal in the cppsim folder and run gdb as (assuming cmake-build-debug is your debug build folder)
gdb cmake-build-debug/bin/your_target_name

![:box moody, Note](When debugging from CLion, the .gdbinit in the cppsim folder will not be read, since CLion starts gdb from the folder where the executable is. This is usually preferred since you might not want the pretty-printers defined in the gdb_helpers folder to replace the ones provided by CLion. You can still source the desired file with pretty-printers in the gdb prompt inside CLion if you want it.)


---

# Skipping uninteresting files when stepping into a function

Sometimes when you step into a line, the debugger will step into a library call before stepping into your actual code. After that you need to finish the current function and step into again until you actually enters your function. In order to avoid this, it is possible to tell gdb to skip uninteresting files, such as files from the std namespace, from the catch library, from armadillo library, etc.

In order to do this, add the lines below to the .gdbinit file in your home folder

```gdb
skip -rfu Catch
skip -rfu _catch_sr
skip -rfu ^std::
skip -rfu ^arma::
```

![:box moody, Note](Anything you put in the .gdbinit file in your home folder will also be used when debugging from CLion. That is, using step into from CLion will not step into these uninteresting files anymore.)

---

# Debugando Segmentation Fault

- Quando gerar um core file, use o comando abaixo

```bash
$ gdb -c core.xxxx
```

```gdb
print $pc
```

- `x` -> comando para examinar a memória
- `x $` -> examina memória do resultado do último comando
- `bt` -> Mostra o backtrace

Se isso não resolver, rode o programa no gdb, dê `start` e rode o comando
`record`. Agora vc pode usar o comando `reverse-stepi` para voltar um passo.

---

# Running commands each time a breakpoint is hit

gdb allow setting commands that should be run each time a specific breakpoint is
hit. Any gdb command can be run in this way, even the run command. 

- Start the debugger as usual with a command similar to the one below in the shell

```bash
gdb path_to_executable/executable_name
```

- Você pode setar um comando para ser executado sempre que um breakpoint for atingido

```gdb
commands 2
> algum comando
> outro comando
> end
```


---

# Running commands each time a breakpoint is hit

- The program below creates an array with 20 elements and fill it with random
  values
  - Most of the time it finishes without issues, but sometimes it crashs
  
```c++
#include <cstdlib>
#include <ctime>
 
int main() {
    srand(time(NULL));
 
    constexpr unsigned int arraySize = 20;
    int array[arraySize];
 
    for(unsigned int i = 0; i < arraySize; i++) {
        auto denominator = (rand() % 200);
        array[i]         = 1 / denominator;
    }
 
    return 0;
}

```

---

# Running commands each time a breakpoint is hit

- Você pode adicionar um breakpoint na saída do programa com

```gdb
break _exit
```

- Para achar o bug faça

```gdb
start
b _exit
```

- Now if you type `i b` in gdb you will see that your breakpoint was added and
  wthat is its number. Suppose the number of the breakpoint at _exit is 2. Now
  used `gdb command 2 `
  -  Type `run`, press <kdb>Enter</kdb>, and type `end` to finish the commands.
     Now run the program with the `run` command
  - If the program finishs without crashing it will hit the `_exit` breakpoint
    and the `run` command will be executed initializing the program again
    - Until eventually the program crashs when the bug happens


---

# Dicas



- Veja watch points
- `whatis <variável>` diz o tipo da variável
- Use `skip` para não entrar em uma função
  - Ex: `foo(boring())` e você quer entrar em `foo`, mas não em `boring`
    - Use `skip boring` e depois `step` para entrar em foo sem entrar em boring
- Frame filters: Veja no cppsim
  - Veja tb: http://jefftrull.github.io/c++/gdb/python/2018/04/24/improved-backtrace.html

---

# Dicas

- Setando breakpoint onde uma exceção é disparada

```gdb
catch throw
run
```

- O problema é que ele para em qualquer exceção disparada
  - Vc usar `catch throw` como um commando que é rodado quando algum outro
    breakpoint for atingido para capturar apenas exceções disparadas depois dele

![:box moody, Nota](Veja outros eventos de catch em </br> http://www.sourceware.org/gdb/current/onlinedocs/gdb.html#Set-Catchpoints)

---

# .gdbinit

Mínima configuração útil
```gdb
set history save on
set print pretty on
set pagination off
set confirm off
```

![:box moody, Dica](Você pode ter um arquivo .gdbinit em projeto com diversas configurações úteis para aquele projeto)

---
class: middle, center, hide-slide-number, hide-logo

.typewriter[
# Thank You
]

.animated.fadeIn.delay-2s[
Scan this code for this presentation URL

![:qrcode](https://www.google.com)
]

.contactblock[
.presenter[Darlan Cavalcante Moreira: [darlan@gtel.ufc.br](mailto:darlan@gtel.ufc.br)]<br />
.home[GTEL - Wireless Telecom Research Group]<br />
.webpage[https://www.gtel.ufc.br]<br />
.location[Fortaleza, Brazil]
]

<!-- Local Variables: -->
<!-- ispell-local-dictionary: "brasileiro" -->
<!-- End: -->
