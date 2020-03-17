import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  static SPACE = ' ';
  operands: string[] = [];
  expression: string[] = [];
  outputExpression = '';
  result: any = 0;
  lastNumberExpression = '';

  private operators = {
    '+': (x, y) => (x + y),
    '-': (x, y) => (x - y),
    '*': (x, y) => (x * y),
    '/': (x, y) => (x / y),
  };
  private unaryOperators = {
    '+/-': (x) => x * (-1),
  };
  private pow = {
    'x^2': (x) => Math.pow(x, 2)
  };
  private clearEntry = {
    CE: (x) => 0
  };
  private point = {
    '.': (x) => x + '.'
  };
  private equals = {
    '=': () => this.result
  };
  private backSpace = {
    '<-': (x) => x.substring(0, x.length - 1)
  };

  init($event: Event) {
    // @ts-ignore
    const exp = $event.target.innerText;
    // found "." or number or operand
    if (isNaN(+exp)) {
      this.addOperation(exp);
    } else {
      this.addExpression(exp);
    }
  }

  addExpression(num: string) {
    this.addNumberToExpression(num);
  }

  private addNumberToExpression(num: string) {
    // create one big number if no operands
    if (!this.operands.length) {
      // if expression is empty then add new number
      if (!this.expression.length) {
        this.expression.push(num);
      } else {
        this.addSubNumber(num);
      }
    } else if (this.isSecondNumber()) {
      this.addSubNumber(num);
    } else {
      this.foundEqualOperation();
      // if no first or second number then create new number
      this.expression.push(num);
    }
    this.result = this.expression[this.expression.length - 1];
  }

  /**
   * Found second number for input to expression
   * @return true if operand have one operation and expression have one number
   */
  private isSecondNumber() {
    return this.operands.length <= 1 && this.expression.length > 1;
  }

  /**
   * Add substring number for first or second number
   */
  private addSubNumber(num: string) {
    const lastExpressionLength = this.expression.length - 1;
    if (this.isSubNumberFirstZero(lastExpressionLength, num)) {
      return;
    } else {
      // if first symbol number in expression include 0 then this number equal zero
      if (this.isSunNumberMixedZero(lastExpressionLength, num) ) {
        // add numbers to sub number
        this.expression[lastExpressionLength] = num;
      } else {
        this.expression[lastExpressionLength] += num;
      }
    }
  }

  /**
   * Found substring first symbol equal zero number and second symbol not zero
   * @return if first symbol zero and second not zero then number equal second number
   */
  private isSunNumberMixedZero(lastExpressionLength: number, num: string) {
    return this.expression[lastExpressionLength].charAt(0) === '0' &&
      num !== '0' && this.expression[lastExpressionLength].lastIndexOf('.') === -1;
  }

  /**
   * Found substring first symbol equal zero number
   * @return true if to first and second symbol of number equal 0 and length this numbers = 1 or operand '.'
   */
  private isSubNumberFirstZero(lastExpressionLength: number, num: string) {
    return this.expression[lastExpressionLength].length === 1 && this.expression[lastExpressionLength].charAt(0) === '0' && num === '0';
  }

  /**
   * If found equals then clear expression, output and operands for next expression
   */
  private foundEqualOperation() {
    if (this.operands[this.operands.length - 1] in this.equals) {
      this.expression.length = 0;
      this.operands.length = 0;
      this.outputExpression = '';
    }
  }

  addOperation(operand: string) {
    if (this.isMixedOperands(operand)) {
      this.expression.push(this.result);
    }  else if (operand in this.point) {
      this.addPoint(operand);
    } else if (operand in this.backSpace) {
      this.calcBackSpace(operand);
    } else if (this.isChangeOperand()) {
      // if change operand after operand
      this.changeOperand(operand);
    } else {
      this.calcSimpleExpression(operand);
    }
  }

  private isMixedOperands(operand: string) {
    if (operand in this.pow) {
      this.calcPow(operand);
      return true;
    } else if (operand in this.unaryOperators) {
      this.calcUnary(operand);
      return true;
    } else if (operand in this.clearEntry) {
      this.calcCE(operand);
      return true;
    }
    return false;
  }

  /**
   * If operand = "x^2" then add 'sqr() 'to output and calculate pow
   */
  private calcPow(operand: string) {
    this.outputExpression += 'sqr(' + this.expression[this.expression.length - 1] + ') ';
    this.mixedPow(operand);
  }

  /**
   * If pow for one number or second number of expression
   */
  private mixedPow(operand: string) {
    // if pow for simple expression 5 + (3^2) = 14
    if (this.expression.length === 1) {
      this.result = this.pow[operand](this.expression.pop()).toString();
    } else {
      // if pow for hard expression 5 + 3 + (this result 5 + 3 = 8)^2 = 72
      this.result = this.pow[operand](this.expression.pop()).toString();
    }
  }

  /**
   * If operand = +/- then add "+" or "-"
   */
  private calcUnary(operand: string) {
    if (this.expression.length) {
      this.result = this.unaryOperators[operand](this.expression.pop()).toString();
    } else {
      this.result = '0';
    }
  }

  /**
   * If operand = CE (clear entry) then lust number of expression equal 0
   */
  private calcCE(operand: string) {
    // if last operation pow then clear number (len - 2, as last symbol space then symbol ")")
    if (this.isLastSymbolBracket()) {
      this.clearOutputOperationPow();
    }
    if (this.expression.length === 1 && this.operands.length) {
      this.result = '0';
      this.foundEqualOperation();
    } else {
      this.result = this.clearEntry[operand](this.expression.pop()).toString();
    }
  }

  /**
   * Found last operation equals pow
   * @return return true if last operation equals pow
   */
  private isLastSymbolBracket() {
    return this.outputExpression[this.outputExpression.length - 2] === ')';
  }

  /**
   * Clear output if found last operation equals pow
   */
  private clearOutputOperationPow() {
    this.outputExpression = this.outputExpression
      .replace(this.outputExpression
        .substring(this.outputExpression
          .lastIndexOf('sqr('), this.outputExpression
          .lastIndexOf(')') + 1), '');
  }

  /**
   * If found point then add to current number of expression
   */
  private addPoint(operand: string) {
    if (this.expression.length && !this.expression[this.expression.length - 1].includes('.')) {
      this.result = this.expression[this.expression.length - 1] = this.point[operand](this.expression[this.expression.length - 1]);
    } else if (!this.expression.length) {
      this.result = '0.';
      this.expression.push(this.result);
    }
  }

  /**
   * If operand equals backspace "<-" then edit last number of expression
   */
  private calcBackSpace(operand: string) {
    if (!this.expression.length) {
      this.result = '0';
    } else {
      // If expression and operand have one number
      if (this.expression.length === 1 && this.operands.length === 1) {
        return;
      }
      const lengthLastExp = this.expression.length - 1;
      this.result = this.expression[lengthLastExp] = this.backSpace[operand](this.expression[lengthLastExp]);
      if (this.expression[lengthLastExp] === '') {
        this.result = this.expression[lengthLastExp] = '0';
      }
    }
  }

  /**
   * Found change operand after first operand
   * @return true if need to change current operand
   */
  private isChangeOperand() {
    return this.expression.length === 1 && this.operands.length === 1;
  }

  /**
   * Change operand after first operand
   */
  private changeOperand(operand: string) {
    if (operand in this.equals) {
      this.expression.push(this.expression[this.expression.length - 1]);
      this.calc(this.operands[0]);
    } else {
      // if change operand then delete last two symbols
      this.operands[this.operands.length - 1] = operand;
      this.outputExpression = this.outputExpression.substring(0, this.outputExpression.length - 2) + operand + AppComponent.SPACE;
    }
  }

  /**
   * Calculate if simple operation "+, -, *, /" or "="
   */
  private calcSimpleExpression(operand: string) {
    if (this.isFoundFirstOperandEquals(operand)) {
      this.calcFirstOperandEquals(operand);
    } else if (this.isRememberExpression(operand)) {
      this.expression.push(this.lastNumberExpression);
      this.calc(this.operands[0]);
    } else {
      this.isClearOperandEquals();
      // if found bracket in outputExpression then clear last number in expression
      if (this.isLastSymbolBracket()) {
        this.outputExpression += operand + ' ';
      } else {
        this.addOutputExpression(operand);
      }
      // calculate expression
      if (this.isCalc()) {
        this.calc(this.operands.shift());
      }
      this.operands.push(operand);
    }
  }

  /**
   * Found first equals operand
   */
  private isFoundFirstOperandEquals(operand: string) {
    return operand in this.equals && this.operands[this.operands.length - 1] !== operand;
  }

  /**
   * If found first operand equals then calculate expression
   */
  private calcFirstOperandEquals(operand: string) {
    this.operands.push(operand);
    this.lastNumberExpression = this.expression[this.expression.length - 1];
    this.addOutputExpression(operand);
    this.calc(this.operands[0]);
  }

  /**
   * If found equals then remember for repeat calculate previous expression
   * @return true if repeat calculate previous expression
   */
  private isRememberExpression(operand: string) {
    return this.operands[this.operands.length - 1] in this.equals && this.operands[this.operands.length - 1] === operand;
  }

  /**
   * If click number after equals then clear expression and operands
   */
  private isClearOperandEquals() {
    if (this.operands[this.operands.length - 1] in this.equals) {
      this.outputExpression = '';
      this.operands.length = 0;
      this.lastNumberExpression = '';
    }
  }

  /**
   * Add last number of expression and current operand
   */
  private addOutputExpression(operand: string) {
    this.outputExpression += this.expression[this.expression.length - 1] + AppComponent.SPACE + operand + AppComponent.SPACE;
  }
  /**
   *  If expression ready calculate
   *  @return true if operand not null and expression have two numbers
   */
  private isCalc() {
    return this.operands.length && this.expression.length > 1;
  }

  private calc(operand: string) {
    if (operand in this.operators) {
      const [y, x] = [+this.expression.pop(), +this.expression.pop()];
      this.result = this.operators[operand](x, y).toString();
      // tslint:disable-next-line:triple-equals
      if (this.result == 'Infinity') {
        this.result = 'Cannot divide by zero‬';
      } else {
      this.expression.push(this.result);
      }
    }
  }
}
