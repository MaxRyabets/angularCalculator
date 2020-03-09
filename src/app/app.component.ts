import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  public static POINT = '.';
  public static POW = 'x^2';
  public static CE = 'CE';
  public static PLUS_MINUS = '+/-';
  public static BACKSPACE = '<-';
  operation = '';
  expression = [];
  result: any = 0;
  temp = 0;
  numberFlag = false;
  queueOperations = [];

  private operators = {
    '+': (x, y) => (x + y).toString(),
    '-': (x, y) => (x - y).toString(),
    '*': (x, y) => (x * y).toString(),
    '/': (x, y) => (x / y).toString(),
  };

  private singleNumberOperation = {
    '=': () => {
      this.queueOperations = [];
      return this.result;
    },
    '+/-': () => (this.result * (-1)).toString(),
  };

  private powerOperation = {
    'x^2': (x) => Math.pow(x, 2).toString(),
  };

  private clearEntry = {
    CE: () => {
      const expLength = this.expression.length;
      if (expLength > 1) {
        this.result = this.temp = 0;
        this.expression.pop();
      } else if (expLength === 1 && (this.operation === '=' || this.operation === AppComponent.CE || this.operation.length === 0)) {
        this.expression = [];
        this.queueOperations = [];
        this.result = this.temp = 0;
      } else if (expLength > 2) {
        this.expression = [];
      } else if (expLength === 1 && (this.operation === '<-' || this.operation === 'CE')) {
        this.result = this.temp = 0;
      }
    }
  };

  private backSpace = {
    '<-': () => {
      const lastElemLength = this.expression.length - 1;
      const lastElemExp = this.expression[lastElemLength];
      if (this.expression.length !== 0) {
      // if expression have big numbers for backspace last numbers, in current number
        if (lastElemExp.length === 1) {
          // if last element equal length 1, but expression have two numbers
          if (this.expression.length === 2 || (this.expression.length === 1 &&
            !this.queueOperations.includes('+')) &&
            !this.queueOperations.includes('-') &&
            !this.queueOperations.includes('/') &&
            !this.queueOperations.includes('*')
          ) {
            this.expression.pop();
            this.numberFlag = true;
          } else {
            if (this.operation.length === 0) {
              this.expression = [];
            } else if (this.expression.length !== 1) {
                this.expression[lastElemLength] = lastElemExp.substring(0, lastElemExp.length - 1);
            }
          }
        } else {
          // if number have "-"
          if (lastElemExp[0] === '-' && lastElemExp.length === 2) {
            this.expression[lastElemLength] = '0';
          } else {
            if (this.expression.length !== 0 && this.queueOperations.length !== 0) {
              if ((!this.queueOperations.includes('+') &&
                !this.queueOperations.includes('-') &&
                !this.queueOperations.includes('/') &&
                !this.queueOperations.includes('*')) ||
                this.expression.length !== 1) {
                this.expression[lastElemLength] = lastElemExp.substring(0, lastElemExp.length - 1);
              }
            } else if (this.expression.length === 0) {
              this.expression = [];
            } else if (this.expression.length !== 0 && this.queueOperations.length === 0) {
              if ((!this.queueOperations.includes('+') &&
                !this.queueOperations.includes('-') &&
                !this.queueOperations.includes('/') &&
                !this.queueOperations.includes('*'))) {
                this.numberFlag = true;
                this.expression[lastElemLength] = lastElemExp.substring(0, lastElemExp.length - 1);
              }
            }
          }
        }
      }
    }
  };

  /**
   * Search operand CE, <-
   */
  private searchClearOperation(operand: string) {
    if (operand in this.backSpace) {
      this.backSpace[operand]();
      if (this.expression.length === 0) {
        this.result = this.temp = 0;
      } else {
        this.result = this.temp = this.expression[this.expression.length - 1];
        if (this.expression.length !== 1) {
          this.numberFlag = true;
        }
      }
    } else if (operand in this.clearEntry) {
      this.clearEntry[operand]();
    }
  }

  addPoint(point: string) {
    if (this.expression.length === 0) {
      this.expression.push('0');
      this.numberFlag = true;
    }
    const expLength = this.expression[this.expression.length - 1];
    if (!expLength.includes('.')) {
      if (this.expression.length === 1 && this.numberFlag){
        this.result = this.expression[this.expression.length - 1] = expLength + point;
      } else if (this.expression.length === 1 && this.operation.length !== 0) {
        this.expression.push('0.');
        this.numberFlag = true;
        this.result = this.temp = this.expression[this.expression.length - 1];
      } else {
        this.result = this.expression[this.expression.length - 1] = expLength + point;
      }
    } else if (expLength.includes('.') && this.operation.length === 0) {
    } else {
      if (this.expression.length === 1 && !this.numberFlag) {
        this.expression.push('0.');
        this.result = this.temp = this.expression[this.expression.length - 1];
        this.numberFlag = true;
      }
    }
  }

  private expFirstPow(operand: string, expLength: number) {
    if (this.expression.length === 1) {
      this.expression.push('0');
    } else {
      this.temp = this.expression[expLength - 1] = this.powerOperation[operand](+this.expression[expLength - 1]);
    }
    this.calc();
    this.operation = '';
    this.numberFlag = true;
  }

  unaryMinus(operand: string) {
    if (operand === '+') {
      this.operation = '-';
    } else {
      this.operation = '+';
    }
    this.expression[this.expression.length - 1] = (this.expression[this.expression.length - 1] * (-1)).toString();
    this.result = this.expression[this.expression.length - 1];
  }

  unaryOperations(operand: string) {
    if (this.expression.length > 1) {
      this.unaryMinus(operand);
    } else {
      this.operation = operand;
      this.singleOperation();
    }
    this.numberFlag = true;
  }

  expQueueOperations(operand: string) {
    if (operand !== '<-') {
      this.queueOperations.push(operand);
      this.operation = this.queueOperations.shift();
      this.calc();
      this.operation = this.queueOperations.shift();
      if (this.operation === '=') {
        this.operation = '';
        this.numberFlag = true;
      }
      this.queueOperations = [];
    }
  }

  addOperation(operand: string) {
    this.numberFlag = false;
    const expLength = this.expression.length;
    const opLength = this.operation.length;
    this.searchClearOperation(operand);
    if (operand === AppComponent.POW && opLength !== 0) {
      this.expFirstPow(operand, expLength);
    } else if (operand === AppComponent.CE && opLength !== 0) {
    } else if (operand === AppComponent.BACKSPACE &&
      this.queueOperations.length === 0 &&
      this.operation !== '' &&
      this.operation !== '<-') {
      this.queueOperations.push(this.operation);
    } else if (operand === AppComponent.PLUS_MINUS) {
      this.unaryOperations(operand);
    } else {
      if (this.queueOperations.length !== 0 &&
        this.operation !== '+' && this.operation !== '-' && this.operation !== '*' && this.operation !== '/') {
          this.expQueueOperations(operand);
      } else {
        if (operand !== '<-') {
          if (expLength === 2 && opLength !== 0) {
            this.calc();
          }
          this.operation = operand;
          if (this.result !== 0 && (operand in this.singleNumberOperation || operand in this.powerOperation)) {
            if (this.operation !== AppComponent.CE) {
              this.calc();
            }
            if (this.operation === '=') {
              this.operation = '';
            }
          }
        }
      }
    }
  }
  /**
   * Search for use x^2, +/-, =
   */
  private singleOperation() {
    if (this.operation in this.singleNumberOperation || this.operation in this.powerOperation) {
      if (this.operation in this.singleNumberOperation) {
        this.temp = this.singleNumberOperation[this.operation]();
      } else if (this.operation in this.powerOperation) {
        this.temp = this.powerOperation[this.operation](this.expression[this.expression.length - 1]);
      }
      this.operation = '';
      this.expression[0] = this.temp;
      this.result = this.temp;
      this.numberFlag = true;
    }
  }

  private expInfinity() {
    // tslint:disable-next-line:triple-equals use-isnan
    if (this.temp == Infinity || isNaN(this.temp)) {
      this.result = this.temp;
      // tslint:disable-next-line:triple-equals
      if (this.temp == Infinity) {
        setTimeout(() => {
          this.result = 'Cannot divide by zero‬';
          this.operation = '';
        }, 1000);
      } else {
        setTimeout(() => {
          this.result = 'Result is undefined‬';
          this.operation = '';
          this.expression.length = 0;
        }, 1000);
      }
      this.result = 0;
      this.temp = 0;
      this.expression.length = 0;
    }
  }

  addExpression(num: string) {
    // if need to create big number
    if (!this.numberFlag) {
      // @ts-ignore
      this.result = num;
      this.expression.push(num);
      this.numberFlag = true;
    } else {
      if (this.expression.length !== 0) {
        const lastElementLength = this.expression.length - 1;
        if (this.expression[lastElementLength][0] === '0' && !this.expression[lastElementLength].indexOf('.')) {
          this.expression[lastElementLength] = num;
        } else {
          this.expression[lastElementLength] = this.expression[lastElementLength] + num;
        }
        this.result = this.expression[lastElementLength];
      }
    }
    if (this.operation === '<-') {
      this.operation = '';
    }
  }

  private calc() {
    if (this.operation in this.operators) {
      const [y, x] = [+this.expression.pop(), +this.expression.pop()];
      this.temp = this.operators[this.operation](x, y);
      this.expression.push(this.temp);
      this.expInfinity();
    }
    this.singleOperation();
    if (this.temp !== 0) {
      this.result = this.temp;
    }
  }

  init($event: Event) {
    // @ts-ignore
    const exp = $event.target.innerText;
    // search "." or number or operand
    if (AppComponent.POINT === exp) {
        this.addPoint(exp);
    } else if (isNaN(+exp)) {
      this.addOperation(exp);
    } else {
      this.addExpression(exp);
    }
  }
}
