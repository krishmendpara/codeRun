
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import json

x_data = [1,2,3,4,5]
y_data = [10,20,15,25,30]

plt.figure(figsize=(10, 6))

graph_type = 'line'
if graph_type == 'line':
    plt.plot(x_data, y_data, marker='o', linewidth=2)
elif graph_type == 'bar':
    plt.bar(x_data, y_data, color='skyblue')
elif graph_type == 'scatter':
    plt.scatter(x_data, y_data, s=100, alpha=0.6)
else:
    plt.plot(x_data, y_data)

plt.title('Sales Over Time', fontsize=16)
plt.xlabel('Month')
plt.ylabel('Sales ($)')
plt.grid(True, alpha=0.3)
plt.savefig('graph_output_1762604491688.png', bbox_inches='tight', dpi=150)
plt.close()
print('Graph generated successfully')
