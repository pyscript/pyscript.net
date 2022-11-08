import sys

if "MicroPython" in sys.version:
    from ulab import numpy
    print('binary extensions... ulab.numpy is compiled into WASM')
else:
    import numpy
    print('binary extensions... numpy is loaded via micropip')

a = numpy.arange(6)
print(a)
b = a.reshape((2, 3))
print(b)
print(numpy.sqrt(b))
