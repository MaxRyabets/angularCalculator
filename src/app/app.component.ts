import { Component } from '@angular/core';
import {delay} from 'rxjs/operators';

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
  result = 0;
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
    '=': () => this.result,
    '+/-': () => (this.result * (-1)).toString(),
  };

  private powerOperation = {
    'x^2': (x) => Math.pow(x, 2).toString(),
  };

  private clearEntry = {
    CE: () => {
      const expLength = this.expression.length;
      if (expLength > 1) {
        this.expression[expLength - 1] = '0';
      } else {
        this.expression[0] = '0';
      }
      if (expLength > 2) {
        this.expression = [];
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
          if (this.expression.length === 2) {
            this.expression[this.expression.length - 1] = '0';
            this.numberFlag = true;
          } else {
            this.expression = [];
          }
        } else {
          // if number have "-"
          if (lastElemExp[0] === '-' && lastElemExp.length === 2) {
            this.expression[lastElemLength] = '0';
          } else {
            this.expression[lastElemLength] = lastElemExp.substring(0, lastElemExp.length - 1);
          }
        }
      }
    }
  };

  addPoint(point: string) {
    const expLength = this.expression[this.expression.length - 1];
    if (!expLength.includes('.')) {
      this.expression[this.expression.length - 1] = expLength + point;
    } else if (expLength.includes('.') && this.operation.length === 0) {
      this.result = this.expression[this.expression.length - 1];
    } else {
      if (this.expression.length === 1) {
        this.expression.push('0.');
      }
      this.result = this.expression[this.expression.length - 1];
      this.numberFlag = true;
    }
  }
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
        this.numberFlag = true;
      }
    } else if (operand in this.clearEntry) {
      this.clearEntry[operand]();
      this.temp = this.expression[this.expression.length - 1];
      if (this.expression.length === 1) {
        this.expression.pop();
      }
      this.result = this.temp;
    }
  }

  private expFirstPow(operand: string, expLength: number) {
    this.temp = this.expression[expLength - 1] = this.powerOperation[operand](+this.expression[expLength - 1]);
    this.calc();
  }

  private expFirstClear(expLength: number) {
    if (expLength > 0) {
      this.expression[expLength - 1] = '0';
      this.temp = this.expression.pop();
    }
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
    this.queueOperations.push(operand);
    this.operation = this.queueOperations.shift();
    this.calc();
    this.operation = this.queueOperations.shift();
    this.queueOperations = [];
  }

  addOperation(operand: string) {
    this.numberFlag = false;
    const expLength = this.expression.length;
    const opLength = this.operation.length;
    this.searchClearOperation(operand);
    if (operand === AppComponent.POW && opLength !== 0) {
      this.expFirstPow(operand, expLength);
    } else if (operand === AppComponent.CE && opLength !== 0) {
      this.expFirstClear(expLength);
    } else if (operand === AppComponent.BACKSPACE && this.queueOperations.length === 0) {
      this.queueOperations.push(this.operation);
    } else if (operand === AppComponent.PLUS_MINUS) {
      this.unaryOperations(operand);
    } else {
      if (this.queueOperations.length !== 0) {
        this.expQueueOperations(operand);
      } else {
        if (expLength === 2 && opLength !== 0) {
          this.calc();
        }
        this.operation = operand;
        if (this.result !== 0 && (operand in this.singleNumberOperation || operand in this.powerOperation)) {
          this.calc();
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
        this.operation = '';
      } else if (this.operation in this.powerOperation) {
        this.temp = this.powerOperation[this.operation](this.expression[this.expression.length - 1]);
      }
      this.expression[0] = this.temp;
      this.result = this.temp;
      this.numberFlag = true;
    }
  }

  private expInfinity() {
    // tslint:disable-next-line:triple-equals use-isnan
    if (this.temp == Infinity || isNaN(this.temp)) {
      this.result = this.temp;
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
      const lastElementLength = this.expression.length - 1;
      this.expression[lastElementLength] = this.expression[lastElementLength] + num;
      this.result = this.expression[lastElementLength];
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
