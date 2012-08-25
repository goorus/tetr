Ice = {};

/**
 * @desc Базовый класс.
 * @var function
 */
Ice.Class = function () {};

/**
 * @desc Функция инициализации.
 * @var function
 */
Ice.Class.prototype.__construct = function () {};

Ice.__temp = 0;

/**
 * @desc Функция для создания дочерних классов.
 * @var function
 */
Ice.Class.extend = function (def)
{

	var class_def = function ()
	{
		if (arguments [0] !== Ice.Class)
		{
			this.__construct.apply (this, arguments);
		}
	};

	var proto = new this (Ice.Class);
	var super_class = this.prototype;

	for (var n in def)
	{
		var item = def [n];
		if (item instanceof Function)
		{
			if (n in super_class)
			{
				item.__parentMethod = super_class [n];
			}

			item.__name = n;
		}
		else
		{
			class_def [n] = item;
		}
		proto [n] = item;
	}

	class_def.prototype = proto;

	/**
	 * @desc Вызываем одноименную функцию родителя
	 */
	class_def.prototype.parent = function ()
	{
		arguments.callee.caller.__parentMethod.apply (this, arguments);
	};

	class_def.extend = this.extend;

	return class_def;
};
