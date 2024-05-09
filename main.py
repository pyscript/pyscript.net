"""
Well done! You've found the source. Now go build cool stuff.
"""
import asyncio
import random
from pyscript import document


# It's the same API as JavaScript when interacting with the document object!
python_terminal = document.getElementById("python-terminal")


async def type_it_in(code):
    """
    Advanced AI to type code into the terminal. ;-)
    """
    lines = code.split("\n")
    for line in lines:
        await asyncio.sleep(1)
        for char in line:
            wait = random.choice([0.05, 0.07, 0.1, 0.15, 0.2, 0.3])
            await asyncio.sleep(wait)
            python_terminal.terminal.write(char)
        python_terminal.process(line.strip())


# Web scale use of advanced AI.
await type_it_in('print("Hello, from PyScript!")\r\n# Your turn...')
